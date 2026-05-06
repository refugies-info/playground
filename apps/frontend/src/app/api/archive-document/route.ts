/**
 * POST /api/archive-document
 *
 * Archive synchrone — met à jour la DB avant de répondre, sans passer par
 * un Vercel Workflow asynchrone. Le router.refresh() côté client voit les
 * nouvelles données immédiatement.
 *
 * ## Flux
 * ```
 * Client (EditorNavigation)
 *   └─ POST /api/archive-document { workflowId, title, markdown, metadata }
 *        ├─ Auth + permission check
 *        ├─ fetch RI webhook /archive
 *        ├─ INSERT publication_records (status: archived)
 *        └─ UPDATE editorial_records.online_status = 'archived'
 * ```
 *
 * ## Réponses
 * | Code | Body                  | Cause                    |
 * |------|-----------------------|--------------------------|
 * | 200  | `{ success: true }`   | Archivé avec succès      |
 * | 400  | `{ error: string }`   | Body invalide            |
 * | 401  | `{ error: string }`   | Non authentifié          |
 * | 403  | `{ error: string }`   | Permission refusée       |
 * | 500  | `{ error: string }`   | Erreur interne           |
 */

import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserProfile } from "@/lib/auth";
import { verifyWorkflowPermission } from "@/services/permission-helper";

const PostBodySchema = z.object({
  workflowId: z.string().uuid(),
  title: z.string(),
  markdown: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // ─── 1. Parse + valider le body ───────────────────────────────────────
    const raw = await request.json().catch(() => null);
    const parsed = PostBodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
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
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      );
    }

    // ─── 3. Permission ────────────────────────────────────────────────────
    const profile = await getUserProfile(supabase, user.id);
    const hasPermission = await verifyWorkflowPermission(
      supabase,
      workflowId,
      user.id,
      profile?.role ?? undefined,
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission d'archiver ce document" },
        { status: 403 },
      );
    }

    // ─── 4. Récupérer la publication existante ────────────────────────────
    const webhookSecret = process.env.RI_WEBHOOK_SECRET;
    const baseUrl = process.env.RI_BASE_URL?.replace(/\/$/, "") ?? "";

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Configuration webhook manquante" },
        { status: 500 },
      );
    }

    const { data: existingPublication } = await supabase
      .from("publication_records")
      .select("id, remote_id")
      .eq("workflow_id", workflowId)
      .eq("target", baseUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // ─── 5. Webhook + publication_record (si déjà publié) ─────────────────
    if (existingPublication?.remote_id) {
      const webhookPayload = {
        email: user.email ?? "",
        dispositif: { _id: existingPublication.remote_id },
      };

      const webhookUrl = `${baseUrl}/api/webhook/dispositif/archive`;
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "webhook-secret": webhookSecret,
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          {
            error:
              (errorData as { message?: string }).message ??
              `Webhook error ${response.status}`,
          },
          { status: 500 },
        );
      }

      const { error: insertError } = await supabase
        .from("publication_records")
        .insert({
          workflow_id: workflowId,
          target: baseUrl,
          remote_id: existingPublication.remote_id,
          status: "archived",
          mode: "archive",
          payload: webhookPayload,
          published_by: user.id,
        });

      if (insertError) {
        console.error(
          insertError,
          "[archive-document] Insert publication_record failed",
        );
        return NextResponse.json(
          { error: "Erreur lors de l'enregistrement de l'archivage" },
          { status: 500 },
        );
      }
    }

    // ─── 6. Mettre à jour editorial_record + translation_records ──────────
    const { data: workflow, error: workflowFetchError } = await supabase
      .from("workflows")
      .select("editorial_record_id")
      .eq("id", workflowId)
      .maybeSingle();

    if (workflowFetchError) {
      console.error(
        workflowFetchError,
        "[archive-document] Fetch workflow failed",
      );
    }

    if (workflow?.editorial_record_id) {
      const { error: updateError } = await supabase
        .from("editorial_records")
        .update({ online_status: "archived", work_status: null })
        .eq("id", workflow.editorial_record_id);

      if (updateError) {
        console.error(
          updateError,
          "[archive-document] Update editorial_record failed",
        );
        return NextResponse.json(
          { error: "Erreur lors de la mise à jour du statut" },
          { status: 500 },
        );
      }

      // Cascade vers les traductions (erreur non-bloquante)
      const { error: translationUpdateError } = await supabase
        .from("translation_records")
        .update({ online_status: "archived" })
        .eq("editorial_record_id", workflow.editorial_record_id);

      if (translationUpdateError) {
        console.error(
          translationUpdateError,
          "[archive-document] Update translation_records failed",
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error, "[archive-document] Unexpected error");
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'archivage" },
      { status: 500 },
    );
  }
}
