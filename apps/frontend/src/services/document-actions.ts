"use server";

import {
  type ComplianceStatus,
  logger,
  type OnlineStatus,
  type WorkStatus,
} from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import {
  archiveWorkflow,
  publicationWorkflow,
  saveWorkflow,
  toggleStatusWorkflow,
} from "@playground/workflows";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { start } from "workflow/api";
import { normalizeMarkdown } from "../lib/markdown/normalizeMarkdown";
import { verifyWorkflowPermission } from "./permission-helper";

// Debug logging to verify workflow imports

/**
 * Verifies user authentication and permissions for a specific action on a workflow.
 *
 * Checks if the user is logged in and has the required role/permissions
 * to perform the requested action ('modify', 'publish', 'archive').
 *
 * @param workflowId - The ID of the workflow to access.
 * @param action - The action being performed.
 * @returns An object containing the user session and Supabase client if successful, or an error response.
 */
async function getAuthorizedSession(
  workflowId: string,
  action: "modify" | "publish" | "archive",
) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    logger.error(userError, `Error getting user for ${action}`);
    return {
      errorResponse: { success: false, error: "Utilisateur non authentifié" },
    };
  }

  const hasPermission = await verifyWorkflowPermission(
    supabase,
    workflowId,
    user.id,
    user.user_metadata?.role,
  );

  if (!hasPermission) {
    logger.warn(
      { userId: user.id, workflowId },
      `Unauthorized attempt to ${action}`,
    );
    const errorMessages = {
      modify: "Vous n'avez pas la permission de modifier ce document",
      publish: "Vous n'avez pas la permission de publier ce document",
      archive: "Vous n'avez pas la permission d'archiver ce document",
    };
    return { errorResponse: { success: false, error: errorMessages[action] } };
  }

  return { user, supabase };
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
  workflowRunId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}> {
  try {
    if (!saveWorkflow) {
      logger.error("saveWorkflow is undefined - cannot start workflow");
      return {
        success: false,
        error: "Configuration error: Workflow not loaded",
      };
    }

    const auth = await getAuthorizedSession(workflowId, "modify");
    if (auth.errorResponse) return auth.errorResponse;
    const { user } = auth;

    const result = await start(saveWorkflow, [workflowId, markdown, user.id]);

    logger.info(
      { workflowRunId: result.runId, workflowId },
      "Save workflow started",
    );

    revalidatePath("/documents/[id]", "page");

    // Note: The UI handles optimistic updates.
    // We return success immediately knowing the workflow is processing in background.

    return {
      success: true,
      workflowRunId: result.runId,
    };
  } catch (error) {
    logger.error(error, "Unexpected error starting save workflow");
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
    const { supabase } = auth;

    // Verify document state (prevent arbitration on already processed docs)
    // We need to check editorial statuses now
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select(
        `
        editorial_record_id,
        editorial_records (
          work_status,
          online_status
        )
      `,
      )
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      logger.error(workflowError, "Error fetching workflow for status toggle");
      return { success: false, error: "Workflow non trouvé" };
    }

    // Safely access nested editorial record
    // We have to cast because the type defs might be tricky with the join,
    // but usually Supabase types handle this if generated correctly.
    // For safety with raw types:
    const editorialRecord = workflow.editorial_records as unknown as {
      work_status: string;
      online_status: string;
    } | null;

    // Check if we can modify
    if (
      editorialRecord?.work_status === "draft" ||
      editorialRecord?.online_status === "published"
    ) {
      return {
        success: false,
        error:
          "Impossible de changer l'arbitrage d'un document en cours de traitement",
      };
    }

    const result = await start(toggleStatusWorkflow, [
      workflowId,
      currentStatus,
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
 * Archives a document.
 *
 * Initiates the archive workflow which:
 * 1. Marks the document as archived on the main application.
 * 2. Updates local records and status.
 *
 * @param workflowId - The ID of the document workflow.
 * @param title - The title of the document.
 * @param markdown - The current markdown content.
 * @param metadata - Additional metadata.
 * @returns The result of the operation, including the workflow run ID.
 */
export async function archiveDocument(
  workflowId: string,
  title: string,
  markdown: string,
  metadata?: Record<string, unknown>,
): Promise<{
  success: boolean;
  workflowRunId?: string;
  error?: string;
}> {
  try {
    const auth = await getAuthorizedSession(workflowId, "archive");
    if (auth.errorResponse) return auth.errorResponse;
    const { user } = auth;

    if (!archiveWorkflow) {
      logger.error("archiveWorkflow is undefined - cannot start workflow");
      return {
        success: false,
        error: "Configuration error: Workflow not loaded",
      };
    }

    const result = await start(archiveWorkflow, [
      {
        workflowId,
        title,
        markdown,
        metadata,
        userId: user.id,
        userEmail: user.email ?? "",
        platform: "refugies.info",
      },
    ]);

    logger.info(
      { workflowRunId: result.runId, workflowId },
      "Archive workflow started",
    );

    revalidatePath("/documents/[id]");

    return {
      success: true,
      workflowRunId: result.runId,
    };
  } catch (error) {
    logger.error(error, "Unexpected error starting archive workflow");
    return { success: false, error: "Erreur inattendue lors de l'archivage" };
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

/**
 * Retrieves the current publication status and public URL of a document.
 *
 * Used for polling after a publication workflow is started to detect when
 * the document is successfully published on the remote platform.
 *
 * @param workflowId - The ID of the workflow to check.
 * @returns Object containing the publication URL if published.
 */
export async function getPublicationStatus(workflowId: string): Promise<{
  success: boolean;
  publishedUrl?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: publicationRecord, error } = await supabase
      .from("publication_records")
      .select("remote_id, status")
      .eq("workflow_id", workflowId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error({ error, workflowId }, "Failed to fetch publication status");
      return { success: false, error: "Failed to fetch publication status" };
    }

    const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");
    const publishedUrl =
      publicationRecord?.remote_id && cleanBaseUrl
        ? `${cleanBaseUrl}/dispositif/${publicationRecord.remote_id}`
        : undefined;

    return { success: true, publishedUrl };
  } catch (error) {
    logger.error(error, "Unexpected error fetching publication status");
    return { success: false, error: "Unexpected error" };
  }
}
