import { logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";
import { getPublisherAdapter } from "./adapters/refugies-info";

/**
 * Result of archiving a document.
 */
export interface ArchiveDocumentResult {
  publicationRecordId: string;
  remoteId: string;
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
 * 4. Updates workflow progress to 'archived'
 *
 * @param input - Archive input with document data and user context
 * @returns Result with archive details
 */
export async function archiveDocumentStep(
  input: ArchiveDocumentInput,
): Promise<StepResult<ArchiveDocumentResult>> {
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

    // Find existing publication (MUST exist to archive)
    const { data: existingPublication } = await supabase
      .from("publication_records")
      .select("id, remote_id")
      .eq("workflow_id", workflowId)
      .eq("target", baseUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!existingPublication?.remote_id) {
      return { success: false, error: "Document was never published" };
    }

    const remoteId = existingPublication.remote_id;

    // Build the webhook payload with 'Archivé' status
    const webhookPayload = {
      email: userEmail,
      dispositif: {
        typeContenu: "dispositif",
        theme: (metadata?.theme as string) || "63286a015d31b2c0cad99615",
        status: "Archivé",
        titreInformatif: title,
        origin: "RCO",
        _id: remoteId,
        translations: {
          fr: {
            content: {
              titreInformatif: title,
              titreMarque: title,
              abstract: "",
              markdown: markdown,
            },
          },
        },
      },
    };

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
        "Archive webhook failed",
      );
      return {
        success: false,
        error:
          (errorData as { message?: string }).message ||
          `Webhook error ${response.status}`,
      };
    }

    // Update existing publication record to archived status
    const { error: updateRecordError } = await supabase
      .from("publication_records")
      .update({
        status: "archived",
        payload: webhookPayload,
        published_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingPublication.id);

    if (updateRecordError) {
      logger.error(updateRecordError, "Error updating publication record");
    }

    // Update workflow progress to 'archived'
    const { error: updateError } = await supabase
      .from("workflows")
      .update({ progress: "archived" })
      .eq("id", workflowId);

    if (updateError) {
      logger.error(updateError, "Error updating workflow progress");
    }

    logger.info({ workflowId, remoteId }, "Document archived successfully");

    return {
      success: true,
      data: {
        publicationRecordId: existingPublication.id,
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
