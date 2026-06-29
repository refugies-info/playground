"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import {
  generateTranslationWorkflow,
  LANGUAGE_WORKFLOWS,
  publishTranslation as publishTranslationInline,
  translationPublicationWorkflow,
} from "@playground/workflows";
import { start } from "@workflow/core/runtime";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// ─── Auth Helper ────────────────────────────────────────────────────────────

/**
 * Verifies user authentication and role for translation actions.
 * Admins/editors can access all translations. Translators are limited
 * to translations matching their assigned language.
 *
 * @returns The user session and Supabase client, or an error response.
 */
type TranslationAction = "save" | "publish" | "retry";

async function getAuthorizedTranslationSession({
  action,
  translationId,
  allowTranslator,
}: {
  action: TranslationAction;
  translationId?: string;
  allowTranslator: boolean;
}) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    logger.error(userError, "Error getting user for translation action");
    return {
      errorResponse: {
        success: false as const,
        error: "Utilisateur non authentifié",
      },
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, language")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (role === "admin" || role === "editor") {
    return { user, supabase };
  }

  if (role === "translator") {
    if (!allowTranslator) {
      logger.warn(
        { userId: user.id, action, translationId },
        "Unauthorized attempt to perform translation action",
      );
      return {
        errorResponse: {
          success: false as const,
          error: "Permissions insuffisantes pour cette action",
        },
      };
    }

    if (!translationId) {
      logger.error(
        { userId: user.id, action },
        "Missing translationId for translation action",
      );
      return {
        errorResponse: {
          success: false as const,
          error: "Paramètre manquant : traduction",
        },
      };
    }

    const { data: translation, error: translationError } = await supabase
      .from("translation_records")
      .select("language")
      .eq("id", translationId)
      .single();

    if (translationError || !translation) {
      logger.error(
        translationError,
        "Translation not found for permission check",
      );
      return {
        errorResponse: {
          success: false as const,
          error: "Traduction introuvable",
        },
      };
    }

    const userLanguage = profile?.language;
    if (!userLanguage) {
      logger.warn(
        { userId: user.id, translationId },
        "Translator has no language configured",
      );
      return {
        errorResponse: {
          success: false as const,
          error: "Aucune langue assignée à ce compte traducteur",
        },
      };
    }

    if (translation.language !== userLanguage) {
      logger.warn(
        {
          userId: user.id,
          translationId,
          translationLanguage: translation.language,
          userLanguage,
        },
        "Unauthorized attempt to perform translation action (language mismatch)",
      );
      return {
        errorResponse: {
          success: false as const,
          error: "Vous n'avez pas la permission d'accéder à cette traduction",
        },
      };
    }

    return { user, supabase };
  }

  logger.warn(
    { userId: user.id, role, action, translationId },
    "Unauthorized attempt to perform translation action",
  );
  return {
    errorResponse: {
      success: false as const,
      error: "Permissions insuffisantes pour cette action",
    },
  };
}

// ─── Actions ────────────────────────────────────────────────────────────────

/**
 * Saves translation content (manual edit by user).
 *
 * @param id - The translation record ID.
 * @param markdown - The new markdown content.
 */
export async function saveTranslation(
  id: string,
  markdown: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthorizedTranslationSession({
      action: "save",
      translationId: id,
      allowTranslator: true,
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    const { error } = await supabase
      .from("translation_records")
      .update({
        markdown,
        work_status: "draft",
        author_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      logger.error(error, "Error updating translation record");
      return {
        success: false,
        error: "Erreur lors de la sauvegarde de la traduction",
      };
    }

    return { success: true };
  } catch (error) {
    logger.error(error, "Unexpected error saving translation");
    return { success: false, error: "Erreur inattendue lors de la sauvegarde" };
  }
}

/**
 * Publishes a translation.
 *
 * Before launching the publication workflow, this action always:
 * 1. Saves the markdown content
 * 2. Sets `author_id` to the current user (claim)
 * 3. Sets `work_status` to 'draft'
 *
 * This ensures the record is in a clean state regardless of whether the
 * client already called `saveTranslation` before.
 *
 * @param id - The translation record ID.
 * @param markdown - The current markdown content to save before publishing.
 */
export async function publishTranslation(
  id: string,
  markdown: string,
): Promise<{
  success: boolean;
  workflowRunId?: string;
  error?: string;
}> {
  try {
    const auth = await getAuthorizedTranslationSession({
      action: "publish",
      translationId: id,
      allowTranslator: true,
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    // Save content + claim authorship + mark as draft before launching workflow
    const { error: saveError } = await supabase
      .from("translation_records")
      .update({
        markdown,
        work_status: "draft",
        author_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (saveError) {
      logger.error(saveError, "Error saving translation before publish");
      return {
        success: false,
        error: "Erreur lors de la sauvegarde avant publication",
      };
    }

    const publishInput = {
      translationId: id,
      userId: user.id,
      userEmail: user.email ?? "",
      platform: "refugies.info" as const,
    };

    // Vercel Workflows dispatch steps to the PRODUCTION deployment regardless
    // of which deployment started the run, so a durable workflow started from a
    // preview deployment would publish with PRODUCTION env (real refugies.info +
    // prod DB) instead of this branch's preview env. To keep preview publishes
    // pointed at staging.refugies.info with this branch's dynamic Supabase DB,
    // run the publication INLINE on the preview deployment. Production keeps the
    // durable workflow for retries/observability.
    if (process.env.VERCEL_ENV !== "production") {
      logger.info(
        { translationId: id, vercelEnv: process.env.VERCEL_ENV },
        "Publishing translation inline (non-production deployment)",
      );

      const inlineResult = await publishTranslationInline(publishInput);

      if (!inlineResult.success) {
        return {
          success: false,
          error: inlineResult.error ?? "Échec de la publication",
        };
      }

      revalidatePath("/translations");
      return { success: true };
    }

    if (!translationPublicationWorkflow) {
      logger.error("translationPublicationWorkflow is undefined");
      return { success: false, error: "Workflow non configuré" };
    }

    const result = await start(translationPublicationWorkflow, [publishInput]);

    logger.info(
      { workflowRunId: result.runId, translationId: id },
      "Translation publication workflow started",
    );

    revalidatePath("/translations");

    return { success: true, workflowRunId: result.runId };
  } catch (error) {
    logger.error(error, "Unexpected error publishing translation");
    return {
      success: false,
      error: "Erreur inattendue lors de la publication",
    };
  }
}

/**
 * Retries the translation generation for a specific translation record.
 *
 * Note: We call `start()` directly here instead of using `triggerTranslationWorkflowStep`
 * because "use step" functions cannot be called from server actions — only from
 * "use workflow" functions.
 *
 * @param translationId - The ID of the translation record to retry.
 */
export async function retryTranslationGeneration(translationId: string) {
  try {
    const auth = await getAuthorizedTranslationSession({
      action: "retry",
      translationId,
      allowTranslator: false,
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    // 1. Fetch translation record to get context
    const { data: translationRecord, error } = await supabase
      .from("translation_records")
      .select("editorial_record_id, language, workflow_id")
      .eq("id", translationId)
      .single();

    if (error || !translationRecord) {
      return {
        success: false,
        error: "Enregistrement de traduction introuvable",
      };
    }

    // 2. Set status to "pending" immediately so UI refresh shows it
    await supabase
      .from("translation_records")
      .update({ work_status: "pending" })
      .eq("id", translationId);

    // 3. Select language-specific workflow (with guard)
    const workflow =
      LANGUAGE_WORKFLOWS[translationRecord.language] ??
      generateTranslationWorkflow;

    if (!workflow) {
      logger.error(
        { language: translationRecord.language },
        "Translation workflow is undefined — cannot start",
      );
      return {
        success: false,
        error: "Erreur de configuration : workflow non chargé",
      };
    }

    // 4. Trigger workflow (async, runs in background)
    await start(workflow, [
      {
        editorialRecordId: translationRecord.editorial_record_id,
        language: translationRecord.language,
        parentWorkflowId: translationRecord.workflow_id || "manual-retry",
        userId: user.id,
      },
    ]);

    logger.info(
      { translationId, userId: user.id },
      "Retried translation generation manually",
    );

    revalidatePath("/translations");

    return { success: true };
  } catch (error) {
    logger.error(error, "Error retrying translation generation");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}
