/**
 * POST /api/editorial-rewrite
 *
 * Démarre un workflow de réécriture IA (Letta) et retourne immédiatement
 * le `runId` du Vercel Workflow. Le runId est aussi persisté en base
 * (`editorial_records.active_run_id`) pour permettre la reprise après
 * refresh, fermeture d'onglet, ou changement de navigateur.
 *
 * ## Flux
 *
 * ```
 * Client (AIFloatingButton)
 *   │
 *   ├─ POST /api/editorial-rewrite { workflowId }
 *   │    ├─ Auth (getUser → getUserProfile → verifyWorkflowPermission)
 *   │    ├─ start(forceEditorialWorkflow) → runId         ← Vercel Workflow
 *   │    ├─ UPDATE editorial_records SET active_run_id = runId
 *   │    └─ return { runId }
 *   │
 *   ├─ GET /api/editorial-rewrite/[runId]   ← attend le résultat (maxDuration=300s)
 *   └─ DELETE /api/editorial-rewrite/[runId] ← annule ou nettoie active_run_id
 * ```
 *
 * ## Réponses
 *
 * | Code | Body                          | Cause                         |
 * |------|-------------------------------|-------------------------------|
 * | 200  | `{ runId: string }`           | Workflow démarré               |
 * | 400  | `{ error: string }`           | workflowId manquant            |
 * | 401  | `{ error: string }`           | Non authentifié                |
 * | 403  | `{ error: string }`           | Permission refusée             |
 * | 500  | `{ error: string }`           | Erreur au démarrage            |
 */

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { forceEditorialWorkflow } from "@playground/workflows";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { z } from "zod";
import { getUserProfile } from "@/lib/auth";
import { verifyWorkflowPermission } from "@/services/permission-helper";

const PostBodySchema = z.object({
  workflowId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // ─── 1. Parse + valider le body ───────────────────────────────────────
    const raw = await request.json().catch(() => null);
    const parsed = PostBodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "workflowId manquant ou invalide" },
        { status: 400 },
      );
    }

    const { workflowId } = parsed.data;

    // ─── 2. Auth ──────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.warn({ userError }, "[editorial-rewrite] Unauthenticated");
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      );
    }

    const userId = user.id;
    const profile = await getUserProfile(supabase, userId);
    const hasPermission = await verifyWorkflowPermission(
      supabase,
      workflowId,
      userId,
      profile?.role ?? undefined,
    );

    if (!hasPermission) {
      logger.warn({ userId, workflowId }, "[editorial-rewrite] Unauthorized");
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de modifier ce document" },
        { status: 403 },
      );
    }

    // ─── 3. Garantir qu'un editorial_record existe avant de démarrer ──────
    // Pour les fiches toutes neuves, l'editorial_record n'existe pas encore.
    // On le crée ici (depuis ingestion_record) pour pouvoir écrire active_run_id
    // de façon synchrone dans le POST — sans dépendre du client restant connecté
    // jusqu'à la complétion du GET.
    // Si l'editorial_record existe déjà, on récupère simplement son id.
    const { data: workflowData } = await supabase
      .from("workflows")
      .select("editorial_record_id, ingestion_record_id")
      .eq("id", workflowId)
      .maybeSingle();

    let editorialRecordId = workflowData?.editorial_record_id ?? null;

    if (!editorialRecordId && workflowData?.ingestion_record_id) {
      logger.info(
        { workflowId },
        "[editorial-rewrite] Creating editorial_record for new fiche",
      );

      const { data: ingestion, error: ingestionError } = await supabase
        .from("ingestion_records")
        .select("markdown, metadata")
        .eq("id", workflowData.ingestion_record_id)
        .maybeSingle();

      if (ingestionError || !ingestion) {
        logger.error(
          { workflowId, ingestionError },
          "[editorial-rewrite] Failed to fetch ingestion_record",
        );
      } else {
        const { data: newRecord, error: insertError } = await supabase
          .from("editorial_records")
          .insert({
            ingestion_record_id: workflowData.ingestion_record_id,
            markdown: ingestion.markdown,
          })
          .select("id")
          .single();

        if (insertError || !newRecord) {
          // Cas typique : race avec un autre process (step Letta, autre POST)
          // qui aurait créé l'editorial_record entre-temps. On re-fetch pour
          // récupérer l'id existant plutôt que de crasher.
          logger.warn(
            { workflowId, insertError },
            "[editorial-rewrite] INSERT editorial_record failed — refetching",
          );
          const { data: refetch } = await supabase
            .from("workflows")
            .select("editorial_record_id")
            .eq("id", workflowId)
            .maybeSingle();
          editorialRecordId = refetch?.editorial_record_id ?? null;
        } else {
          editorialRecordId = newRecord.id;
          const { error: linkError } = await supabase
            .from("workflows")
            .update({ editorial_record_id: editorialRecordId })
            .eq("id", workflowId);
          if (linkError) {
            logger.error(
              { workflowId, editorialRecordId, linkError },
              "[editorial-rewrite] Failed to link editorial_record to workflow",
            );
          } else {
            logger.info(
              { workflowId, editorialRecordId },
              "[editorial-rewrite] editorial_record created",
            );
          }
        }
      }
    }

    // Si on n'a TOUJOURS pas d'editorial_record_id, on bloque : sans lui,
    // active_run_id ne sera pas persisté → reprise impossible après refresh.
    if (!editorialRecordId) {
      logger.error(
        { workflowId },
        "[editorial-rewrite] Cannot proceed without editorial_record_id",
      );
      return NextResponse.json(
        {
          error:
            "Impossible de préparer le document pour la réécriture. Réessayez ou contactez le support.",
        },
        { status: 500 },
      );
    }

    // ─── 4. Démarrer le workflow ──────────────────────────────────────────
    // biome-ignore lint/suspicious/noExplicitAny: workflow typing
    const result = await start(forceEditorialWorkflow as any, [workflowId]);

    // ─── 5. Persister le runId dans editorial_records ─────────────────────
    // Synchrone et garanti : editorial_record existe depuis l'étape 3
    // (sinon on aurait return 500 plus haut).
    const { error: runIdError } = await supabase
      .from("editorial_records")
      .update({ active_run_id: result.runId })
      .eq("id", editorialRecordId);

    if (runIdError) {
      // Non bloquant : le workflow tourne déjà. La reprise après refresh
      // sera impossible mais l'utilisateur recevra le résultat tant qu'il
      // reste sur la page.
      logger.error(
        { runId: result.runId, editorialRecordId, runIdError },
        "[editorial-rewrite] Failed to persist active_run_id (resume disabled)",
      );
    } else {
      logger.info(
        { runId: result.runId, editorialRecordId },
        "[editorial-rewrite] active_run_id written",
      );
    }

    logger.info(
      { runId: result.runId, workflowId },
      "[editorial-rewrite] Workflow started",
    );

    return NextResponse.json({ runId: result.runId });
  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : String(err);
    logger.error({ rawMessage }, "[editorial-rewrite] Failed to start");

    const userMessage = [
      "Impossible de démarrer la réécriture.",
      "",
      `Erreur : ${rawMessage}`,
      `Date : ${new Date().toISOString()}`,
    ].join("\n");

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
