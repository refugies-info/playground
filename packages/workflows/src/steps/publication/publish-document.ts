import { logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";
import { getPublisherAdapter } from "./adapters/refugies-info";

/**
 * Result of publishing a document.
 */
export interface PublishDocumentResult {
  publicationRecordId: string;
  remoteId: string;
  isUpdate: boolean;
  publishedUrl: string;
}

/**
 * Input for publishing a document.
 */
export interface PublishDocumentInput {
  workflowId: string;
  title: string;
  markdown: string;
  metadata?: Record<string, unknown>;
  userId: string;
  userEmail: string;
  platform?: string;
}

/**
 * Publishes a document to the target platform via webhook.
 *
 * This step:
 * 1. Checks for existing publication (CREATE vs UPDATE)
 * 2. Calls the platform webhook
 * 3. Stores/updates the publication record
 * 4. Updates workflow online_status to 'published' and clears work_status
 *
 * @param input - Publication input with document data and user context
 * @returns Result with publication details
 */
export async function publishDocumentStep(
  input: PublishDocumentInput,
): Promise<StepResult<PublishDocumentResult>> {
  "use step";

  const {
    workflowId,
    title,
    markdown,
    metadata,
    userId,
    userEmail,
    platform = "refugies.info",
  } = input;

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

    // Check for existing publication to reuse the remote_id if needed
    const { data: existingPublication } = await supabase
      .from("publication_records")
      .select("remote_id")
      .eq("workflow_id", workflowId)
      .eq("target", baseUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const existingRemoteId = existingPublication?.remote_id;

    // Use adapter to build payload
    const webhookPayload = await adapter.buildPayload({
      title,
      markdown,
      metadata: metadata || {},
      userEmail,
      status: "Actif",
      existingRemoteId: existingRemoteId || undefined,
    });

    // Call the appropriate specialized endpoint
    const action = existingRemoteId ? "update" : "create";
    const webhookUrlWithAction = adapter.getWebhookUrl(action);

    // Call the webhook
    const response = await fetch(webhookUrlWithAction, {
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
        "Publication webhook failed",
      );
      return {
        success: false,
        error:
          (errorData as { message?: string }).message ||
          `Webhook error ${response.status}`,
      };
    }

    const result = (await response.json()) as { id?: string };
    const remoteId = result.id;

    if (!remoteId) {
      logger.error(result, "Publication webhook did not return an ID");
      return { success: false, error: "Publication ID not received" };
    }

    // 3. fetch the workflow to get linked record IDs

    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("editorial_record_id")
      .eq("id", workflowId)
      .maybeSingle();

    if (workflowError) {
      logger.error(
        workflowError,
        "Error fetching workflow in publishDocumentStep",
      );
    }

    if (!workflow) {
      logger.error({ workflowId }, "Workflow not found in publishDocumentStep");
      return { success: false, error: "Workflow not found" };
    }

    // 4. Fetch the author_id from the editorial record
    let author_id: string | null = null;
    if (workflow.editorial_record_id) {
      const { data: edRecord, error: edError } = await supabase
        .from("editorial_records")
        .select("author_id")
        .eq("id", workflow.editorial_record_id)
        .maybeSingle();

      if (edError) {
        logger.error(edError, "Error fetching editorial record author");
      } else if (edRecord) {
        author_id = edRecord.author_id;
      }
    }

    // Store or update publication record

    const { data: newRecord, error: insertError } = await supabase
      .from("publication_records")
      .insert({
        workflow_id: workflowId,
        editorial_record_id: workflow.editorial_record_id,
        target: baseUrl,
        remote_id: remoteId,
        status: "published",
        mode: "publish",
        payload: webhookPayload,
        published_by: userId,
        author_id,
      })
      .select("id")
      .maybeSingle();

    if (insertError || !newRecord) {
      logger.error(insertError, "Error storing publication record");
      return { success: false, error: "Failed to store publication record" };
    }

    const publicationRecordId = newRecord.id;

    // Update workflow online_status to 'published' and clear work_status

    // Update workflow online_status to 'published' and clear work_status
    // Now targeting editorial_records
    if (workflow.editorial_record_id) {
      // TODO: move to state machine logic
      // This status transition logic should be moved to a centralized state machine
      // when implementing the state machine refactoring with Luis.
      const { error: updateError } = await supabase
        .from("editorial_records")
        .update({ online_status: "published", work_status: null })
        .eq("id", workflow.editorial_record_id);

      if (updateError) {
        logger.error(
          updateError,
          "Error updating editorial_record online_status",
        );
      }

      // Restore translation_records online_status based on their publication_records
      // TODO: move to state machine logic
      // This status restoration logic should be moved to a centralized state machine
      // when implementing the state machine refactoring with Luis.
      // Fetch all translation_records for this editorial_record
      const { data: translationRecords, error: trError } = await supabase
        .from("translation_records")
        .select("id")
        .eq("editorial_record_id", workflow.editorial_record_id);

      if (trError) {
        logger.error(
          trError,
          "Error fetching translation_records for status restoration",
        );
      } else if (translationRecords && translationRecords.length > 0) {
        // For each translation_record, check its publication_records
        const updatePromises = translationRecords.map(async (tr) => {
          // Get the latest publication_record for this translation
          const { data: latestPub, error: pubError } = await supabase
            .from("publication_records")
            .select("status")
            .eq("translation_record_id", tr.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (pubError) {
            logger.error(
              pubError,
              `Error fetching publication_records for translation ${tr.id}`,
            );
            return;
          }

          // Determine the online_status based on the latest publication_record
          let translationOnlineStatus: string | null;
          if (latestPub?.status === "published") {
            translationOnlineStatus = "published";
          } else if (latestPub?.status === "archived") {
            translationOnlineStatus = "archived";
          } else {
            // No publication_record means the translation was never published independently
            // Reset to NULL (it may have been archived when the editorial_record was archived)
            translationOnlineStatus = null;
          }

          // Update the translation_record
          const { error: updateTrError } = await supabase
            .from("translation_records")
            .update({ online_status: translationOnlineStatus })
            .eq("id", tr.id);

          if (updateTrError) {
            logger.error(
              updateTrError,
              `Error updating translation_record ${tr.id} online_status to ${translationOnlineStatus}`,
            );
          }
        });
        await Promise.all(updatePromises);

        logger.info(
          {
            editorialRecordId: workflow.editorial_record_id,
            count: translationRecords.length,
          },
          "Translation records status restored based on publication_records",
        );
      }
    } else {
      logger.warn(
        { workflowId },
        "No editorial record found to update status on publish",
      );
    }

    const publishedUrl = adapter.buildPublishedUrl(remoteId);

    logger.info(
      { workflowId, remoteId, publishedUrl },
      "Document published successfully",
    );

    return {
      success: true,
      data: {
        publicationRecordId,
        remoteId,
        isUpdate: false,
        publishedUrl,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    logger.error(error, "Unexpected error in publishDocumentStep");
    return {
      success: false,
      error: errorMsg,
    };
  }
}
