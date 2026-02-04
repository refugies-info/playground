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
 * 4. Updates workflow progress to 'published'
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
    const webhookPayload = adapter.buildPayload({
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
      })
      .select("id")
      .single();

    if (insertError || !newRecord) {
      logger.error(insertError, "Error storing publication record");
      return { success: false, error: "Failed to store publication record" };
    }

    const publicationRecordId = newRecord.id;

    // Update workflow progress
    const { error: updateError } = await supabase
      .from("workflows")
      .update({ progress: "published" })
      .eq("id", workflowId);

    if (updateError) {
      logger.error(updateError, "Error updating workflow progress");
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
