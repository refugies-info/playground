import { extractTitleFromMarkdown, logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";
import { getPublisherAdapter } from "./adapters/refugies-info";

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
      return { success: false, error: "Traduction non trouvée" };
    }

    if (!translation.markdown) {
      return { success: false, error: "La traduction n'a pas de contenu" };
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
      return {
        success: false,
        error:
          "La fiche source doit être publiée avant de pouvoir publier une traduction",
      };
    }

    const remoteId = sourcePublication.remote_id;
    const baseUrl = sourcePublication.target;

    // 3. Extract title and clean markdown
    const title =
      (await extractTitleFromMarkdown(translation.markdown)) || "Sans titre";

    // 4. Prepare payload and call webhook
    const webhookSecret = process.env.RI_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return { success: false, error: "Missing webhook secret configuration" };
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
      return {
        success: false,
        error:
          (errorData as { message?: string }).message ||
          `Webhook error ${response.status}`,
      };
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
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
