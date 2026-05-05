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
import { getUserProfile } from "@/lib/auth";
import { verifyWorkflowPermission } from "@/services/permission-helper";

export async function POST(request: NextRequest) {
  try {
    // ─── 1. Parse body ────────────────────────────────────────────────────
    const body = await request.json().catch(() => null);
    // biome-ignore lint/suspicious/noExplicitAny: body from JSON.parse is any
    const workflowId =
      typeof (body as any)?.workflowId === "string"
        ? String((body as any).workflowId)
        : null;

    if (!workflowId) {
      return NextResponse.json(
        { error: "workflowId manquant ou invalide" },
        { status: 400 },
      );
    }

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

    // ─── 3. Démarrer le workflow ──────────────────────────────────────────
    // biome-ignore lint/suspicious/noExplicitAny: workflow typing
    const result = await start(forceEditorialWorkflow as any, [workflowId]);

    // ─── 4. Persister le runId dans editorial_records ─────────────────────
    // Permet la reprise après refresh, fermeture d'onglet, ou changement de navigateur.
    const { data: workflow } = await supabase
      .from("workflows")
      .select("editorial_record_id")
      .eq("id", workflowId)
      .single();

    if (workflow?.editorial_record_id) {
      await supabase
        .from("editorial_records")
        .update({ active_run_id: result.runId })
        .eq("id", workflow.editorial_record_id);
    } else {
      logger.warn(
        { runId: result.runId, workflowId },
        "[editorial-rewrite] No editorial_record_id — cannot persist active_run_id",
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
