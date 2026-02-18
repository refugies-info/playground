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
    translationId: string;
    remoteId?: string;
    errorMessage: string;
    userId: string;
  },
) {
  const targetUrl = process.env.RI_BASE_URL || "refugies.info";

  try {
    await supabase.from("publication_records").insert({
      workflow_id: params.workflowId,
      translation_record_id: params.translationId,
      target: targetUrl,
      remote_id: params.remoteId || "unknown",
      status: "failed",
      mode: "translation",
      error_message: params.errorMessage,
      published_by: params.userId,
      author_id: params.userId,
    });
  } catch (error) {
    logger.error(error, "Failed to create error publication record");
  }
}

/**
 * Result of publishing a translation.
 */
export interface PublishTranslationResult {
  publicationRecordId: string;
  remoteId: string;
  publishedUrl: string;
}

/**
 * Input for publishing a translation.
 */
export interface PublishTranslationInput {
  translationId: string;
  userId: string;
  userEmail: string;
  platform?: string;
}

/**
 * Publishes a translation to the target platform via webhook.
 *
 * This step:
 * 1. Fetches the translation record and linked editorial record
 * 2. Finds the latest publication record for the editorial record to get the remote_id
 * 3. Extracts the title from the translation markdown (first H1)
 * 4. Calls the platform webhook via adapter
 * 5. Stores the publication record with mode='translation'
 * 6. Updates translation record online_status to 'published' and clears work_status
 *
 * @param input - Publication input with translation ID and user context
 * @returns Result with publication details
 */
export async function publishTranslationStep(
  input: PublishTranslationInput,
): Promise<StepResult<PublishTranslationResult>> {
  "use step";

  const {
    translationId,
    userId,
    userEmail,
    platform = "refugies.info",
  } = input;

  let translationWorkflowId: string | undefined;

  /**
   * Helper to fail with error record creation
   * Creates a failed publication_records entry and returns error result
   * Accessible in both try and catch blocks
   */
  const failStep = async (
    supabase: ReturnType<typeof getSupabaseClient>,
    errorMessage: string,
    remoteId?: string,
  ): Promise<StepResult<PublishTranslationResult>> => {
    if (translationWorkflowId) {
      await createFailedPublicationRecord(supabase, {
        workflowId: translationWorkflowId,
        translationId,
        errorMessage,
        userId,
        remoteId,
      });
    }
    return { success: false, error: errorMessage };
  };

  try {
    const supabase = getSupabaseClient();
    const adapter = getPublisherAdapter(platform);

    // 1. Fetch translation record
    const { data: translation, error: translationError } = await supabase
      .from("translation_records")
      .select("id, editorial_record_id, language, markdown, workflow_id")
      .eq("id", translationId)
      .maybeSingle();

    if (translationError || !translation) {
      logger.error(
        { translationId, error: translationError },
        "Translation record not found",
      );
      const error = "Traduction non trouvée";
      // Cannot create failed record if we don't have the translation record
      // This is a critical error that should not happen in normal operation
      return { success: false, error };
    }

    // Store workflow_id for error handling
    translationWorkflowId = translation.workflow_id;

    if (!translation.markdown) {
      return failStep(supabase, "La traduction n'a pas de contenu");
    }

    // 2. Fetch the latest publication record for the editorial record
    const { data: sourcePublication, error: pubError } = await supabase
      .from("publication_records")
      .select("remote_id, target")
      .eq("editorial_record_id", translation.editorial_record_id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pubError || !sourcePublication?.remote_id) {
      logger.warn(
        { editorialRecordId: translation.editorial_record_id },
        "Source publication not found",
      );
      return failStep(
        supabase,
        "La fiche source doit être publiée avant de pouvoir publier une traduction",
      );
    }

    const remoteId = sourcePublication.remote_id;
    const baseUrl = sourcePublication.target;

    // 3. Extract title and clean markdown
    const title =
      (await extractTitleFromMarkdown(translation.markdown)) || "Sans titre";

    // 4. Prepare payload and call webhook
    const webhookSecret = process.env.RI_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return failStep(supabase, "Missing webhook secret configuration");
    }

    const webhookPayload = await adapter.buildTranslationPayload({
      language: translation.language,
      title,
      markdown: translation.markdown,
      existingRemoteId: remoteId,
      userEmail,
    });

    const webhookUrlTranslation = adapter.getWebhookUrl("translation");

    const response = await fetch(webhookUrlTranslation, {
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
        "Translation publication webhook failed",
      );
      const error =
        (errorData as { message?: string }).message ||
        `Webhook error ${response.status}`;
      return failStep(supabase, error, remoteId);
    }

    // 5. Create publication record
    const { data: newRecord, error: insertError } = await supabase
      .from("publication_records")
      .insert({
        workflow_id: translation.workflow_id,
        translation_record_id: translationId,
        target: baseUrl,
        remote_id: remoteId,
        status: "published",
        mode: "translation",
        payload: webhookPayload,
        published_by: userId,
        author_id: userId, // The translator/publisher
      })
      .select("id")
      .maybeSingle();

    if (insertError || !newRecord) {
      logger.error(insertError, "Error storing translation publication record");
      // This is a weird edge case - the webhook succeeded but we can't store the record
      // We can't create another failed record since the insert just failed
      // Just return the error
      return { success: false, error: "Failed to store publication record" };
    }

    // 6. Update translation record status
    const { error: updateError } = await supabase
      .from("translation_records")
      .update({ online_status: "published", work_status: null })
      .eq("id", translationId);

    if (updateError) {
      logger.error(
        updateError,
        "Error updating translation record online_status",
      );
      // Not returning error here as the publication was successful on remote
    }

    const publishedUrl = adapter.buildPublishedUrl(remoteId);

    logger.info(
      { translationId, remoteId, publishedUrl },
      "Translation published successfully",
    );

    return {
      success: true,
      data: {
        publicationRecordId: newRecord.id,
        remoteId,
        publishedUrl,
      },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in publishTranslationStep");
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Try to create a failed publication record so the error appears in the UI
    // Realtime will notify frontend via publication_records INSERT
    const supabase = getSupabaseClient();
    return failStep(supabase, errorMessage);
  }
}
