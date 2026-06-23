import { extractTitleFromMarkdown, logger } from "@playground/shared-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";
import { getPublisherAdapter } from "./adapters/refugies-info";

/**
 * Helper to create a failed publication record and log the error to the UI.
 * This ensures errors from the workflow are visible to users via Realtime.
 */
async function createFailedPublicationRecord(
  supabase: SupabaseClient,
  params: {
    workflowId: string;
    editorialRecordId?: string;
    remoteId?: string;
    errorMessage: string;
    userId: string;
  },
) {
  const targetUrl = process.env.RI_BASE_URL?.replace(/\/$/, "") || "";

  try {
    const { error: insertError } = await supabase
      .from("publication_records")
      .insert({
        workflow_id: params.workflowId,
        editorial_record_id: params.editorialRecordId || null,
        target: targetUrl,
        remote_id: params.remoteId || "",
        status: "failed",
        mode: "publish",
        error_message: params.errorMessage,
        published_by: params.userId,
        author_id: null,
      });

    if (insertError) {
      logger.error(
        { insertError, params },
        "Failed to insert failed publication record — Realtime feedback will not fire",
      );
    } else {
      logger.info(
        { workflowId: params.workflowId },
        "Failed publication record created — Realtime should notify frontend",
      );
    }
  } catch (error) {
    logger.error(error, "Unexpected error creating failed publication record");
  }
}

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

  /**
   * Helper to fail with error record creation.
   * Creates a failed publication_records entry so the error appears in the UI via Realtime.
   */
  const failStep = async (
    supabase: ReturnType<typeof getSupabaseClient>,
    errorMessage: string,
    editorialRecordId?: string,
    remoteId?: string,
  ): Promise<StepResult<PublishDocumentResult>> => {
    await createFailedPublicationRecord(supabase, {
      workflowId,
      editorialRecordId,
      errorMessage,
      userId,
      remoteId,
    });
    return { success: false, error: errorMessage };
  };

  try {
    const supabase = getSupabaseClient();
    const adapter = getPublisherAdapter(platform);

    // Get webhook configuration
    const webhookSecret = process.env.RI_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return failStep(supabase, "Missing webhook secret configuration");
    }

    // Get base URL for target matching
    const baseUrl = process.env.RI_BASE_URL?.replace(/\/$/, "") || "";

    // Check for existing *successful* publication to reuse the remote_id (MongoDB ObjectId)
    // Only look at published records — failed records may have placeholder remote_ids
    const { data: existingPublication } = await supabase
      .from("publication_records")
      .select("remote_id")
      .eq("workflow_id", workflowId)
      .eq("target", baseUrl)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const existingRemoteId = existingPublication?.remote_id;

    // Recompute title from markdown to ensure H1 changes are reflected
    const markdownTitle = await extractTitleFromMarkdown(markdown);
    const effectiveTitle = markdownTitle || title;

    // Use adapter to build payload
    const webhookPayload = await adapter.buildPayload({
      title: effectiveTitle,
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

      // Build a detailed error message including validation details if available
      // RI webhooks return: { message, errors: [{ key, message }] }
      const typed = errorData as {
        message?: string;
        errors?: Array<{ key: string; message: string }>;
      };
      let error = typed.message || `Webhook error ${response.status}`;

      if (Array.isArray(typed.errors) && typed.errors.length > 0) {
        const details = typed.errors
          .map((e) => `${e.key}: ${e.message}`)
          .join(" | ");
        error = `${error} — ${details}`;
      }

      return failStep(supabase, error, undefined, existingRemoteId);
    }

    const result = (await response.json()) as { id?: string };
    const remoteId = result.id;

    if (!remoteId) {
      logger.error(result, "Publication webhook did not return an ID");
      return failStep(supabase, "Publication ID not received");
    }

    // Re-create Supabase client after the (potentially long) webhook call
    // to avoid stale/timed-out connections from the connection pool.
    const db = getSupabaseClient();

    // 3. fetch the workflow to get linked record IDs

    const { data: workflow, error: workflowError } = await db
      .from("workflows")
      .select("editorial_record_id, assignee_id")
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
      return failStep(db, "Workflow not found");
    }

    // 4. Assignee is now stored on the workflow itself (RI-1340)
    const assignee_id: string | null = workflow.assignee_id ?? null;

    // Store or update publication record

    const { data: newRecord, error: insertError } = await db
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
        author_id: assignee_id,
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
      const { error: updateError } = await db
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
      const { data: translationRecords, error: trError } = await db
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
          const { data: latestPub, error: pubError } = await db
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
          const { error: updateTrError } = await db
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

    // Try to create a failed publication record so the error appears in the UI
    // Realtime will notify frontend via publication_records INSERT
    const supabase = getSupabaseClient();
    return failStep(supabase, errorMsg);
  }
}
