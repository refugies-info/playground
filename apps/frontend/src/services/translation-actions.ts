"use server";

import { logger, validateField } from "@playground/shared-types";
import { createSupabaseServerClient, type Json } from "@playground/supabase";
import {
  generateTranslationWorkflow,
  LANGUAGE_WORKFLOWS,
  translationPublicationWorkflow,
} from "@playground/workflows";
import { getRun, start } from "@workflow/core/runtime";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

// ─── Auth Helper ────────────────────────────────────────────────────────────

/**
 * Verifies user authentication and role for translation actions.
 * Admins/editors can access all translations. Translators are limited
 * to translations matching their assigned language.
 *
 * @returns The user session and Supabase client, or an error response.
 */
type TranslationAction = "save" | "publish" | "retry" | "cancel";

async function getAuthorizedTranslationSession({
  action,
  translationId,
  allowTranslator,
}: {
  action: TranslationAction;
  translationId?: string;
  allowTranslator: boolean;
}) {
  const [currentUser, cookieStore] = await Promise.all([
    getCurrentUser(),
    cookies(),
  ]);
  const supabase = createSupabaseServerClient(cookieStore);

  const role = currentUser.role;

  if (role === "admin" || role === "editor") {
    return { currentUser, supabase };
  }

  if (role === "translator") {
    if (!allowTranslator) {
      logger.warn(
        { userId: currentUser.id, action, translationId },
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
        { userId: currentUser.id, action },
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

    const userLanguage = currentUser.language;
    if (!userLanguage) {
      logger.warn(
        { userId: currentUser.id, translationId },
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
          userId: currentUser.id,
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

    return { currentUser, supabase };
  }

  logger.warn(
    { userId: currentUser.id, role, action, translationId },
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
): Promise<{ success: boolean; error?: string; archived?: boolean }> {
  try {
    const auth = await getAuthorizedTranslationSession({
      action: "save",
      translationId: id,
      allowTranslator: true,
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { currentUser, supabase } = auth;

    // Read current archive state before saving. We still persist the content
    // (never lose the translator's work), but flag `archived` so the client can
    // open the "fiche archivée" modal even if it hasn't received the cascade yet.
    const { data: currentRecord } = await supabase
      .from("translation_records")
      .select("online_status")
      .eq("id", id)
      .single();
    const archived = currentRecord?.online_status === "archived";

    const { error } = await supabase
      .from("translation_records")
      .update({
        markdown,
        author_id: currentUser.id,
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

    return { success: true, archived };
  } catch (error) {
    logger.error(error, "Unexpected error saving translation");
    return { success: false, error: "Erreur inattendue lors de la sauvegarde" };
  }
}

/**
 * Saves a single translated metadata field (RI-1379).
 *
 * Pendant traduction de `saveMetadataFieldAction` : une seule clé de
 * `translation_records.metadata` est écrite, via une RPC, pour ne pas écraser
 * les autres (le titre traduit y vit aussi, et sert de repli à la recherche).
 *
 * @param id - The translation record ID.
 * @param key - The metadata key (e.g. "abstract").
 * @param value - The new value. `undefined` deletes the key.
 */
export async function saveTranslationMetadataFieldAction(
  id: string,
  key: string,
  value: unknown,
): Promise<{ success: boolean; error?: string }> {
  if (!id || !key) {
    return { success: false, error: "Paramètres manquants" };
  }

  // Même validation qu'en FR : les deux versions partagent le schéma du champ.
  const validation = validateField(key, value);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  try {
    const auth = await getAuthorizedTranslationSession({
      action: "save",
      translationId: id,
      allowTranslator: true,
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { supabase } = auth;

    const { error } = await supabase.rpc("update_translation_metadata_field", {
      record_id: id,
      field_key: key,
      // `undefined` = suppression de la clé ; `null` = vidage explicite.
      field_value: (value === undefined ? null : value) as Json,
      delete_key: value === undefined,
    });

    if (error) {
      logger.error(error, "Error updating translation metadata field");
      return {
        success: false,
        error: "Erreur lors de la sauvegarde de la métadonnée",
      };
    }

    revalidatePath(`/translations/${id}/metadata`);
    return { success: true };
  } catch (error) {
    logger.error(error, "Unexpected error saving translation metadata field");
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
    const { currentUser, supabase } = auth;

    // Save content + claim authorship + mark as draft before launching workflow
    const { error: saveError } = await supabase
      .from("translation_records")
      .update({
        markdown,
        work_status: "draft",
        author_id: currentUser.id,
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

    if (!translationPublicationWorkflow) {
      logger.error("translationPublicationWorkflow is undefined");
      return { success: false, error: "Workflow non configuré" };
    }

    const result = await start(translationPublicationWorkflow, [
      {
        translationId: id,
        userId: currentUser.id,
        userEmail: currentUser.email ?? "",
        platform: "refugies.info",
      },
    ]);

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
      allowTranslator: true,
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { currentUser, supabase } = auth;

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
    const run = await start(workflow, [
      {
        editorialRecordId: translationRecord.editorial_record_id,
        language: translationRecord.language,
        parentWorkflowId: translationRecord.workflow_id || "manual-retry",
        userId: currentUser.id,
      },
    ]);

    logger.info(
      { translationId, userId: currentUser.id, runId: run.runId },
      "Retried translation generation manually",
    );

    revalidatePath("/translations");

    return { success: true as const, runId: run.runId };
  } catch (error) {
    logger.error(error, "Error retrying translation generation");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

/**
 * Cancels an in-progress translation regeneration.
 *
 * Cancels the Vercel Workflow run (no-op if already finished) and resets the
 * translation record's work_status back to "to_process" so the UI leaves its
 * loading state. Called from the translation detail page (TranslationContext).
 *
 * @param translationId - The translation record ID.
 * @param runId - The Vercel Workflow runId returned by retryTranslationGeneration.
 */
export async function cancelTranslationGeneration(
  translationId: string,
  runId: string,
) {
  try {
    const auth = await getAuthorizedTranslationSession({
      action: "cancel",
      translationId,
      allowTranslator: true,
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { supabase } = auth;

    try {
      await getRun(runId).cancel();
    } catch (err) {
      // Le workflow est peut-être déjà terminé — non bloquant.
      logger.warn(
        { runId, translationId, err },
        "Cancel translation run failed (non-blocking)",
      );
    }

    await supabase
      .from("translation_records")
      .update({ work_status: "to_process" })
      .eq("id", translationId);

    revalidatePath("/translations");

    return { success: true as const };
  } catch (error) {
    logger.error(error, "Error cancelling translation generation");
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}
