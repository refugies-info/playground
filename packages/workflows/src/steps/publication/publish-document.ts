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
    const webhookUrl = adapter.getWebhookUrl();
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
      .single();

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

    // Call the webhook
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

    // 3. fetch the author_id from the editorial_record or translation_record
    // We need to know which record to fetch based on the workflow
    // For now, let's assume it's an editorial_record based workflow if not translation logic
    // But better: fetch the workflow to see what record is attached
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select(
        "editorial_record:editorial_record_id(author_id), translation_record:translation_record_id(author_id)",
      )
      .eq("id", workflowId)
      .single();

    if (workflowError) {
      logger.error(workflowError, "Error fetching workflow for author_id");
    }

    // Simplified strictly typed author extraction
    type JoinedRecord = { author_id: string | null };
    type WorkflowWithAuthors = {
      editorial_record: JoinedRecord | JoinedRecord[] | null;
      translation_record: JoinedRecord | JoinedRecord[] | null;
    };

    const getAuthorDetail = (
      record: JoinedRecord | JoinedRecord[] | null | undefined,
    ) => {
      if (!record) return null;
      if (Array.isArray(record)) {
        return record.length > 0 ? record[0].author_id : null;
      }
      return record.author_id;
    };

    // Cast the workflow result to a known shape to avoid implicit any errors on join
    // Supabase JS client types for joined tables can vary (array vs object) based on relationships
    const typedWorkflow = workflow as unknown as WorkflowWithAuthors;

    const author_id =
      getAuthorDetail(typedWorkflow.editorial_record) ||
      getAuthorDetail(typedWorkflow.translation_record) ||
      null;

    // Store or update publication record
    const { data: newRecord, error: insertError } = await supabase
      .from("publication_records")
      .insert({
        workflow_id: workflowId,
        target: baseUrl,
        remote_id: remoteId,
        status: "published",
        mode: "publish",
        payload: webhookPayload,
        published_by: userId,
        author_id,
      })
      .select("id")
      .single();

    if (insertError || !newRecord) {
      logger.error(insertError, "Error storing publication record");
      return { success: false, error: "Failed to store publication record" };
    }

    const publicationRecordId = newRecord.id;

    // Update workflow online_status to 'published' and clear work_status
    const { error: updateError } = await supabase
      .from("workflows")
      .update({ online_status: "published", work_status: null })
      .eq("id", workflowId);

    if (updateError) {
      logger.error(updateError, "Error updating workflow online_status");
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
    logger.error(error, "Unexpected error in publishDocumentStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
