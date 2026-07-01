/**
 * POST /api/archive-document
 *
 * Archive synchrone — met à jour la DB avant de répondre, sans passer par
 * un Vercel Workflow asynchrone. Le router.refresh() côté client voit les
 * nouvelles données immédiatement.
 */

import { logger, TYPE_ARCHIVE } from "@playground/shared-types";
import {
  createSupabaseServerClient,
  type Database,
} from "@playground/supabase";
import { recordActivity } from "@playground/workflows";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { verifyWorkflowPermission } from "@/services/permission-helper";

const PostBodySchema = z.object({
  workflowId: z.string().uuid(),
  title: z.string(),
  markdown: z.string(),
});

type EditorialRecordInsert =
  Database["public"]["Tables"]["editorial_records"]["Insert"];
type EditorialRecordUpdate =
  Database["public"]["Tables"]["editorial_records"]["Update"];

type LatestPublication = {
  remote_id?: string;
  status?: string;
};

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null);
    const parsed = PostBodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { workflowId, markdown } = parsed.data;

    const [currentUser, cookieStore] = await Promise.all([
      getCurrentUser(),
      cookies(),
    ]);
    const supabase = createSupabaseServerClient(cookieStore);

    const hasPermission = await verifyWorkflowPermission(
      supabase,
      workflowId,
      currentUser.id,
      currentUser.role ?? undefined,
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission d'archiver ce document" },
        { status: 403 },
      );
    }

    const { data: workflow, error: workflowError } = await supabase
      .from("workflows_enriched")
      .select(
        "id, editorial_record_id, ingestion_record_id, computed_online_status, latest_publication",
      )
      .eq("id", workflowId)
      .maybeSingle();

    if (workflowError) {
      logger.error(workflowError, "[archive-document] Fetch workflow failed");
      return NextResponse.json(
        { error: "Erreur lors de la récupération du document" },
        { status: 500 },
      );
    }

    if (!workflow) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 },
      );
    }

    if (workflow.computed_online_status === "archived") {
      return NextResponse.json({ success: true, alreadyArchived: true });
    }

    const latestPublication =
      workflow.latest_publication as LatestPublication | null;
    const remoteId = latestPublication?.remote_id;
    const baseUrl = process.env.RI_BASE_URL?.replace(/\/$/, "") ?? "";

    if (remoteId) {
      const webhookSecret = process.env.RI_WEBHOOK_SECRET;

      if (!webhookSecret) {
        return NextResponse.json(
          { error: "Configuration webhook manquante" },
          { status: 500 },
        );
      }

      const webhookPayload = {
        email: currentUser.email ?? "",
        dispositif: { _id: remoteId },
      };

      const response = await fetch(
        `${baseUrl}/api/webhook/dispositif/archive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "webhook-secret": webhookSecret,
          },
          body: JSON.stringify(webhookPayload),
        },
      );

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
          remote_id: remoteId,
          status: "archived",
          mode: "archive",
          payload: webhookPayload,
          published_by: currentUser.id,
        });

      if (insertError) {
        logger.error(
          insertError,
          "[archive-document] Insert publication_record failed",
        );
        return NextResponse.json(
          { error: "Erreur lors de l'enregistrement de l'archivage" },
          { status: 500 },
        );
      }
    }

    let editorialRecordId = workflow.editorial_record_id;

    if (editorialRecordId) {
      const archiveUpdate: EditorialRecordUpdate = {
        markdown,
        online_status: "archived",
        work_status: null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("editorial_records")
        .update(archiveUpdate)
        .eq("id", editorialRecordId);

      if (updateError) {
        logger.error(
          updateError,
          "[archive-document] Update editorial_record failed",
        );
        return NextResponse.json(
          { error: "Erreur lors de la mise à jour du statut" },
          { status: 500 },
        );
      }
    } else {
      if (!workflow.ingestion_record_id) {
        return NextResponse.json(
          { error: "Aucun enregistrement d'ingestion trouvé" },
          { status: 500 },
        );
      }

      const archiveInsert: EditorialRecordInsert = {
        ingestion_record_id: workflow.ingestion_record_id,
        markdown,
        online_status: "archived",
        work_status: null,
      };

      const { data: newRecord, error: insertError } = await supabase
        .from("editorial_records")
        .insert(archiveInsert)
        .select("id")
        .single();

      if (insertError || !newRecord) {
        logger.error(
          insertError,
          "[archive-document] Create editorial_record failed",
        );
        return NextResponse.json(
          { error: "Erreur lors de l'archivage du document" },
          { status: 500 },
        );
      }

      editorialRecordId = newRecord.id;

      const { error: linkError } = await supabase
        .from("workflows")
        .update({ editorial_record_id: editorialRecordId })
        .eq("id", workflowId);

      if (linkError) {
        logger.error(
          { workflowId, editorialRecordId, linkError },
          "[archive-document] Link editorial_record failed",
        );
        return NextResponse.json(
          { error: "Erreur lors de l'archivage du document" },
          { status: 500 },
        );
      }
    }

    const { error: translationUpdateError } = await supabase
      .from("translation_records")
      .update({ online_status: "archived" })
      .eq("editorial_record_id", editorialRecordId);

    if (translationUpdateError) {
      logger.error(
        translationUpdateError,
        "[archive-document] Update translation_records failed",
      );
    }

    await recordActivity({
      action: TYPE_ARCHIVE,
      authorId: currentUser.id,
      workflowId,
      activity: { editorialRecordId, remoteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(error, "[archive-document] Unexpected error");
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'archivage" },
      { status: 500 },
    );
  }
}
