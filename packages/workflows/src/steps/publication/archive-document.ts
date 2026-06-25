import { logger, TYPE_ARCHIVAGE } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { recordActivity } from "../common/activity-log";
import { getSupabaseClient } from "../common/supabase";
import { getPublisherAdapter } from "./adapters/refugies-info";

/**
 * Result of archiving a document.
 */
/**
 * Result of archiving a document.
 */
export interface ArchiveDocumentResult {
  publicationRecordId?: string;
  remoteId?: string;
}

/**
 * Input for archiving a document.
 */
export interface ArchiveDocumentInput {
  workflowId: string;
  title: string;
  markdown: string;
  metadata?: Record<string, unknown>;
  userId: string;
  userEmail: string;
  platform?: string;
}

/**
 * Archives a document on the target platform via webhook.
 *
 * This step:
 * 1. Finds existing publication (MUST exist to archive)
 * 2. Calls the platform webhook with 'Archivé' status
 * 3. Updates the publication record status
 * 4. Updates workflow online_status to 'archived' and clears work_status
 *
 * @param input - Archive input with document data and user context
 * @returns Result with archive details
 */
export async function archiveDocumentStep(
  input: ArchiveDocumentInput,
): Promise<StepResult<ArchiveDocumentResult>> {
  "use step";

  const { workflowId, userId, userEmail, platform = "refugies.info" } = input;

  try {
    const supabase = getSupabaseClient();
    const adapter = getPublisherAdapter(platform);

    // Get webhook configuration
    const webhookSecret = process.env.RI_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return { success: false, error: "Missing webhook secret configuration" };
    }

    // Get base URL for target matching
    const baseUrl = process.env.RI_BASE_URL?.replace(/\/$/, "") || "";

    // Check for existing publication (optional)
    const { data: existingPublication } = await supabase
      .from("publication_records")
      .select("id, remote_id")
      .eq("workflow_id", workflowId)
      .eq("target", baseUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let remoteId: string | undefined;
    let newRecordId: string | undefined;

    // Only proceed with webhook and new record if publication exists
    if (existingPublication?.remote_id) {
      remoteId = existingPublication.remote_id;

      // Use adapter to build specialized archive payload
      const webhookPayload = await adapter.buildArchivePayload({
        existingRemoteId: remoteId as string,
        userEmail,
      });

      const webhookUrlArchive = adapter.getWebhookUrl("archive");

      // Call the webhook
      const response = await fetch(webhookUrlArchive, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "webhook-secret": webhookSecret,
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error(
          { status: response.status, error: errorData },
          "Archive webhook failed",
        );
        return {
          success: false,
          error:
            (errorData as { message?: string }).message ||
            `Webhook error ${response.status}`,
        };
      }

      // Create a new publication record for archive (history)
      const { data: newRecord, error: insertError } = await supabase
        .from("publication_records")
        .insert({
          workflow_id: workflowId,
          target: baseUrl,
          remote_id: remoteId,
          status: "archived",
          mode: "archive",
          payload: webhookPayload,
          published_by: userId,
        })
        .select("id")
        .single();

      if (insertError || !newRecord) {
        logger.error(insertError, "Error storing archive publication record");
        return { success: false, error: "Failed to store archive publication" };
      }
      newRecordId = newRecord.id;
    } else {
      logger.info(
        { workflowId },
        "Document never published - skipping webhook and record creation",
      );
    }

    // Update workflow online_status to 'archived' and clear work_status
    // Need to fetch editorial linkage first
    const { data: workflow, error: workflowFetchError } = await supabase
      .from("workflows")
      .select("editorial_record_id")
      .eq("id", workflowId)
      .maybeSingle();

    if (workflowFetchError) {
      logger.error(
        workflowFetchError,
        "Error fetching workflow ID for archive status update",
      );
    }

    if (workflow?.editorial_record_id) {
      // TODO: move to state machine logic
      // This status transition logic should be moved to a centralized state machine
      const { error: updateError } = await supabase
        .from("editorial_records")
        .update({ online_status: "archived", work_status: null })
        .eq("id", workflow.editorial_record_id);

      if (updateError) {
        logger.error(
          updateError,
          "Error updating editorial_record online_status to archived",
        );
        return { success: false, error: "Failed to update workflow status" };
      }

      // Archive all associated translation_records
      // TODO: move to state machine logic
      // This cascade archive logic should be moved to a centralized state machine
      const { error: translationUpdateError } = await supabase
        .from("translation_records")
        .update({ online_status: "archived" })
        .eq("editorial_record_id", workflow.editorial_record_id);

      if (translationUpdateError) {
        logger.error(
          translationUpdateError,
          "Error updating translation_records online_status to archived",
        );
        // Don't fail the whole operation, just log the error
      } else {
        logger.info(
          { editorialRecordId: workflow.editorial_record_id },
          "Associated translation_records archived successfully",
        );
      }
    } else {
      logger.warn({ workflowId }, "No editorial record found to archive");
    }

    logger.info({ workflowId, remoteId }, "Document archived successfully");

    await recordActivity({
      action: TYPE_ARCHIVAGE,
      authorId: userId,
      workflowId,
      activity: { publicationRecordId: newRecordId, remoteId },
    });

    return {
      success: true,
      data: {
        publicationRecordId: newRecordId,
        remoteId,
      },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in archiveDocumentStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
