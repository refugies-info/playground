import {
  extractTitleFromMarkdown,
  logger,
  stripFirstH1,
  TYPE_PUBLICATION_LANGUE,
} from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import type {
  PublishTranslationInput,
  PublishTranslationResult,
} from "@playground/workflows";

/**
 * Inline (non-durable) equivalent of `publishTranslationStep`.
 *
 * WHY THIS EXISTS — Vercel Workflows dispatch steps to the PRODUCTION
 * deployment regardless of which deployment started the run, so a durable
 * workflow triggered from a preview deployment publishes with PRODUCTION env
 * (real refugies.info + prod DB). To let preview/staging deployments publish to
 * `staging.refugies.info` with their own branch Supabase DB, the publication is
 * run INLINE on the preview deployment instead — this module resolves env
 * (`RI_BASE_URL`, `RI_WEBHOOK_SECRET`, Supabase) from the deployment it runs on.
 *
 * It must live in the frontend app (NOT in `@playground/workflows`): the
 * Workflow build plugin scans the workflows package and rejects any non-`"use
 * step"` function that reaches Node-only modules (pino, gray-matter). Keeping
 * this logic outside that package avoids the scan. It is intentionally
 * self-contained (no `@playground/workflows` runtime imports) for the same
 * reason — only type-only imports, which are erased at build time.
 *
 * Trade-off: runs synchronously in the server action with no retry/durability.
 * Acceptable for preview/staging testing.
 */
type StepResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const RI_TRANSLATION_WEBHOOK_PATH = "/api/webhook/dispositif/translation";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }
  return getSupabaseAdmin(url, key);
}

export async function publishTranslationInline(
  input: PublishTranslationInput,
): Promise<StepResult<PublishTranslationResult>> {
  const { translationId, userId, userEmail } = input;

  try {
    const supabase = getSupabaseClient();

    const baseUrl = process.env.RI_BASE_URL;
    if (!baseUrl) {
      return { success: false, error: "RI_BASE_URL is not configured" };
    }
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    const webhookSecret = process.env.RI_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { success: false, error: "Missing webhook secret configuration" };
    }

    // Verification log: which RI target does the INLINE (preview/staging) path
    // resolve? Runs on the preview deployment, so this reflects the Preview-scope
    // env (expected: https://staging.refugies.info). Compare with the durable
    // step's log, which runs on the prod deployment and resolves prod env.
    logger.info(
      {
        translationId,
        path: "inline",
        vercelEnv: process.env.VERCEL_ENV ?? "local",
        riBaseUrl: cleanBaseUrl,
        webhookUrl: `${cleanBaseUrl}${RI_TRANSLATION_WEBHOOK_PATH}`,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      "Resolved RI target for translation publication",
    );

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

    if (!translation.workflow_id) {
      return { success: false, error: "La traduction n'a pas de workflow lié" };
    }
    const workflowId = translation.workflow_id;

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

    // 3. Extract title and clean markdown
    const title =
      (await extractTitleFromMarkdown(translation.markdown)) || "Sans titre";
    const cleanedMarkdown = await stripFirstH1(translation.markdown);

    // 4. Build payload and call the webhook
    const webhookPayload = {
      email: userEmail,
      dispositif: {
        _id: remoteId,
        translations: {
          [translation.language]: {
            content: {
              titreInformatif: title,
              titreMarque: "",
              abstract: "",
              markdown: cleanedMarkdown,
            },
          },
        },
      },
    };

    const response = await fetch(
      `${cleanBaseUrl}${RI_TRANSLATION_WEBHOOK_PATH}`,
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
      logger.error(
        { status: response.status, error: errorData },
        "Translation publication webhook failed (inline)",
      );
      const error =
        (errorData as { message?: string }).message ||
        `Webhook error ${response.status}`;
      return { success: false, error };
    }

    // 5. Create publication record
    const { data: newRecord, error: insertError } = await supabase
      .from("publication_records")
      .insert({
        workflow_id: workflowId,
        translation_record_id: translationId,
        target: cleanBaseUrl,
        remote_id: remoteId,
        status: "published",
        mode: "translation",
        payload: webhookPayload,
        published_by: userId,
        author_id: userId,
      })
      .select("id")
      .maybeSingle();

    if (insertError || !newRecord) {
      logger.error(
        insertError,
        "Error storing translation publication record (inline)",
      );
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
        "Error updating translation record online_status (inline)",
      );
    }

    const publishedUrl = `${cleanBaseUrl}/dispositif/${remoteId}`;

    // 7. Record activity (append-only audit trail). Failures are swallowed.
    try {
      await supabase.from("activity_logs").insert({
        action: TYPE_PUBLICATION_LANGUE,
        author_id: userId,
        workflow_id: workflowId,
        activity: {
          language: translation.language,
          translationId,
          remoteId,
          publishedUrl,
        },
      });
    } catch (activityError) {
      logger.error(activityError, "Failed to record activity log (inline)");
    }

    logger.info(
      { translationId, remoteId, publishedUrl },
      "Translation published successfully (inline)",
    );

    return {
      success: true,
      data: { publicationRecordId: newRecord.id, remoteId, publishedUrl },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in publishTranslationInline");
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
