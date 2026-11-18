"use server";

import {
  type ComplianceStatus,
  logger,
  type OnlineStatus,
  type WorkStatus,
} from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import {
  forceMetadataOnlyWorkflow,
  publicationWorkflow,
  saveDocumentStep,
  toggleStatusWorkflow,
} from "@playground/workflows";
import { getRun, start } from "@workflow/core/runtime";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getCurrentUser } from "../lib/auth";
import { normalizeMarkdown } from "../lib/markdown/normalizeMarkdown";
import { verifyWorkflowPermission } from "./permission-helper";

// Debug logging to verify workflow imports

/**
 * Verifies user authentication and permissions for a specific action on a workflow.
 *
 * Checks if the user is logged in and has the required role/permissions
 * to perform the requested action ('modify', 'publish').
 *
 * @param workflowId - The ID of the workflow to access.
 * @param action - The action being performed.
 * @returns An object containing the user session and Supabase client if successful, or an error response.
 */
async function getAuthorizedSession(
  workflowId: string,
  action: "modify" | "publish",
) {
  const [currentUser, cookieStore] = await Promise.all([
    getCurrentUser(),
    cookies(),
  ]);
  const supabase = createSupabaseServerClient(cookieStore);

  const hasPermission = await verifyWorkflowPermission(
    supabase,
    workflowId,
    currentUser.id,
    currentUser.role ?? undefined,
  );

  if (!hasPermission) {
    logger.warn(
      { userId: currentUser.id, workflowId },
      `Unauthorized attempt to ${action}`,
    );
    const errorMessages = {
      modify: "Vous n'avez pas la permission de modifier ce document",
      publish: "Vous n'avez pas la permission de publier ce document",
    };
    return { errorResponse: { success: false, error: errorMessages[action] } };
  }

  return { user: currentUser, supabase };
}

/**
 * Saves the editorial content of a document.
 *
 * Initiates a background workflow to:
 * 1. Update the editorial record with new markdown content.
 * 2. Update the workflow history and metadata.
 *
 * @param workflowId - The ID of the document workflow.
 * @param markdown - The new markdown content to save.
 * @returns The result of the operation, including the workflow run ID.
 */
export async function saveDocument(
  workflowId: string,
  markdown: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const auth = await getAuthorizedSession(workflowId, "modify");
    if (auth.errorResponse) return auth.errorResponse;
    const { user } = auth;

    const saveResult = await saveDocumentStep(workflowId, markdown, user.id);

    if (!saveResult.success) {
      return { success: false, error: saveResult.error ?? "Save failed" };
    }

    logger.info({ workflowId }, "Document saved successfully");

    revalidatePath("/documents/[id]", "page");

    return { success: true };
  } catch (error) {
    logger.error(error, "Unexpected error during save workflow");
    return {
      success: false,
      error: "Erreur inattendue lors de la sauvegarde",
    };
  }
}

/**
 * Toggles the compliance status of a document (e.g., compliant <-> non_compliant).
 *
 * Triggers a workflow to update the status and calculates expected new states
 * for immediate UI feedback (optimistic update pattern).
 *
 * @param workflowId - The ID of the document workflow.
 * @param currentStatus - The current compliance status ('compliant' or 'non_compliant').
 * @returns The new status values for optimistic UI updates.
 */
export async function toggleWorkflowStatus(
  workflowId: string,
  currentStatus: string,
): Promise<{
  success: boolean;
  newComplianceStatus?: ComplianceStatus;
  newWorkStatus?: WorkStatus | null;
  newOnlineStatus?: OnlineStatus;
  error?: string;
}> {
  try {
    if (!toggleStatusWorkflow) {
      logger.error("toggleStatusWorkflow is undefined");
      return {
        success: false,
        error: "Configuration error: Workflow not loaded",
      };
    }

    const auth = await getAuthorizedSession(workflowId, "modify");
    if (auth.errorResponse) return auth.errorResponse;
    const { supabase, user } = auth;

    // Verify the workflow exists before starting the toggle workflow.
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("id")
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      logger.error(workflowError, "Error fetching workflow for status toggle");
      return { success: false, error: "Workflow non trouvé" };
    }

    const result = await start(toggleStatusWorkflow, [
      workflowId,
      currentStatus,
      user.id,
      user.email ?? "",
    ]);

    logger.info(
      { workflowRunId: result.runId, workflowId },
      "Toggle status workflow started",
    );

    // Calculate optimistic new status for immediate UI feedback
    const newComplianceStatus =
      currentStatus === "compliant" ? "non_compliant" : "compliant";

    let newWorkStatus: WorkStatus | null = null;
    let newOnlineStatus: OnlineStatus = "unpublished";

    if (newComplianceStatus === "compliant") {
      newWorkStatus = "to_process";
      newOnlineStatus = "unpublished";
    } else {
      newWorkStatus = null;
      newOnlineStatus = "archived";
    }

    // DB Updates are handled by the workflow for consistency.
    // We proceed to return optimistic values for UI update.

    revalidatePath("/documents/[id]", "page");
    revalidatePath("/documents/[id]/activity-logs", "page");

    return {
      success: true,
      newComplianceStatus,
      newWorkStatus,
      newOnlineStatus,
    };
  } catch (error) {
    logger.error(error, "Unexpected error removing workflow status");
    return { success: false, error: "Unexpected error occurred" };
  }
}

/**
 * Retrieves the webhook secret for preview authentication.
 *
 * This server action allows the client to obtain the secret securely
 * without embedding it in the client-side bundle.
 *
 * @returns The webhook secret string.
 */
export async function getPreviewSecret(): Promise<{
  success: boolean;
  secret?: string;
  error?: string;
}> {
  const webhookSecret = process.env.RI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("Missing RI_WEBHOOK_SECRET for preview");
    return { success: false, error: "Configuration serveur manquante" };
  }

  return { success: true, secret: webhookSecret };
}

/**
 * Publishes a document to Réfugiés.info.
 *
 * Initiates the publication workflow which:
 * 1. Sends the normalized markdown to the main application via webhook.
 * 2. Creates a publication record.
 * 3. Updates the document status to 'published'.
 * 4. Optionally triggers translation workflows.
 *
 * @param workflowId - The ID of the document workflow.
 * @param title - The title of the document.
 * @param markdown - The markdown content to publish.
 * @param metadata - Additional metadata for the publication.
 * @param triggerTranslations - Whether to automatically start translation workflows.
 * @returns The result of the operation, including the workflow run ID.
 */
export async function publishDocument(
  workflowId: string,
  title: string,
  markdown: string,
  metadata?: Record<string, unknown>,
  triggerTranslations?: boolean,
  isUrgent?: boolean,
): Promise<{
  success: boolean;
  workflowRunId?: string;
  error?: string;
}> {
  try {
    const auth = await getAuthorizedSession(workflowId, "publish");
    if (auth.errorResponse) return auth.errorResponse;
    const { user } = auth;

    // Normalize markdown to prevent parsing issues with nested directives
    const normalizedMarkdown = normalizeMarkdown(markdown);

    if (!publicationWorkflow) {
      logger.error("publicationWorkflow is undefined - cannot start workflow");
      return {
        success: false,
        error: "Configuration error: Workflow not loaded",
      };
    }

    const result = await start(publicationWorkflow, [
      {
        workflowId,
        title,
        markdown: normalizedMarkdown,
        metadata,
        userId: user.id,
        userEmail: user.email ?? "",
        platform: "refugies.info",
      },
      triggerTranslations ?? false,
      isUrgent ?? false,
    ]);

    logger.info(
      { workflowRunId: result.runId, workflowId },
      "Publication workflow started",
    );

    revalidatePath("/documents/[id]", "page");

    return {
      success: true,
      workflowRunId: result.runId,
    };
  } catch (error) {
    logger.error(error, "Unexpected error starting publication workflow");
    return {
      success: false,
      error: "Erreur inattendue lors de la publication",
    };
  }
}

/**
 * Retrieves the raw editorial content of a workflow.
 *
 * Primarily used for debugging or inspecting the exact markdown stored
 * in the `editorial_record` associated with a workflow.
 *
 * @param workflowId - The ID of the workflow.
 * @returns Object containing the markdown content string.
 */
export async function getEditorialContent(
  workflowId: string,
): Promise<{ success: boolean; content?: string; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select(
        `
        id,
        editorial_record:editorial_record_id (
          markdown
        )
      `,
      )
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      logger.error(workflowError, "Error fetching workflow for debug content");
      return { success: false, error: "Workflow not found" };
    }

    const markdown = workflow?.editorial_record?.markdown || "";

    return { success: true, content: markdown };
  } catch (error) {
    logger.error(error, "Unexpected error getting editorial content");
    return { success: false, error: "Unexpected error" };
  }
}

// Returns the run ID at once: step retries take minutes, longer than the
// server action timeout, so the client polls getMetadataRunStatus.
export async function triggerForceMetadataOnly(
  workflowId: string,
  model?: string,
): Promise<{ success: boolean; workflowRunId?: string; error?: string }> {
  try {
    const auth = await getAuthorizedSession(workflowId, "modify");
    if (auth.errorResponse) return auth.errorResponse;
    if (model && auth.user.role !== "admin") {
      return { success: false, error: "Choix du modèle réservé aux admins" };
    }

    const result = await start(forceMetadataOnlyWorkflow, [workflowId, model]);
    logger.info(
      { workflowRunId: result.runId, workflowId, model },
      "Force metadata only workflow started",
    );
    return { success: true, workflowRunId: result.runId };
  } catch (error) {
    logger.error(
      error,
      "Unexpected error starting force metadata only workflow",
    );
    return {
      success: false,
      error: "Erreur inattendue lors du démarrage de la régénération",
    };
  }
}

export async function getMetadataRunStatus(
  workflowId: string,
  runId: string,
): Promise<{ status?: string; error?: string }> {
  const auth = await getAuthorizedSession(workflowId, "modify");
  if (auth.errorResponse) return { error: auth.errorResponse.error };
  try {
    return { status: await getRun(runId).status };
  } catch (error) {
    logger.error({ error, runId }, "Failed to read metadata run status");
    return { error: "Statut du run indisponible" };
  }
}
