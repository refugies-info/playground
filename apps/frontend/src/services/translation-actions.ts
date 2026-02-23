"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import {
  generateTranslationWorkflow,
  LANGUAGE_WORKFLOWS,
  translationPublicationWorkflow,
} from "@playground/workflows";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { start } from "workflow/api";

// ─── Auth Helper ────────────────────────────────────────────────────────────

/**
 * Verifies user authentication and role for translation actions.
 * Only admins and editors can perform translation operations.
 *
 * @returns The user session and Supabase client, or an error response.
 */
async function getAuthorizedTranslationSession() {
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
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "admin" && role !== "editor") {
    logger.warn(
      { userId: user.id },
      "Unauthorized attempt to perform translation action",
    );
    return {
      errorResponse: {
        success: false as const,
        error: "Permissions insuffisantes pour cette action",
      },
    };
  }

  return { user, supabase };
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
    const auth = await getAuthorizedTranslationSession();
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
 * @param id - The translation record ID.
 * @param _markdown - The markdown content (reserved for future webhook use).
 */
export async function publishTranslation(
  id: string,
  _markdown: string,
): Promise<{
  success: boolean;
  workflowRunId?: string;
  error?: string;
}> {
  try {
    const auth = await getAuthorizedTranslationSession();
    if (auth.errorResponse) return auth.errorResponse;
    const { user } = auth;

    if (!translationPublicationWorkflow) {
      logger.error("translationPublicationWorkflow is undefined");
      return { success: false, error: "Workflow non configuré" };
    }

    const result = await start(translationPublicationWorkflow, [
      {
        translationId: id,
        userId: user.id,
        userEmail: user.email ?? "",
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
    const auth = await getAuthorizedTranslationSession();
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
