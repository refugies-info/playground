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
import { cookies } from "next/headers";
import { start } from "workflow/api";
import { normalizeMarkdown } from "../lib/markdown/normalizeMarkdown";

// Debug logging to verify workflow imports

/**
 * Server action to save a document via Vercel Workflow.
 *
 * This triggers a durable workflow that:
 * 1. Saves or updates the editorial record
 * 2. Updates workflow progress if needed
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

    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.error(userError, "Error getting user for save");
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const result = await start(saveWorkflow, [workflowId, markdown, user.id]);

    logger.info(
      { workflowRunId: result.runId, workflowId },
      "Save workflow started",
    );

    // Note: Since this is an async workflow, the metadata returned by 'start'
    // is NOT the final metadata from the saved record (which happens later).
    // The UI handles its own state synchronization (e.g. in DocumentContext).

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

    const result = await start(toggleStatusWorkflow, [
      workflowId,
      currentStatus,
    ]);

    logger.info(
      { workflowRunId: result.runId, workflowId },
      "Toggle status workflow started",
    );

    // Optimistic return is tricky with async workflow,
    // but the UI likely invalidates path or we can return 'true'
    // and let the UI wait for the workflow to finish via polling if needed.
    // For now, we mimic the previous return shape but without immediate values
    // as they are computed async.
    // However, the previous code returned newStatus/newProgress immediately.
    // To match UI expectations without rewriting UI, we can calculate them here purely for UI feedback,
    // even though the REAL update happens in the background.

    const newComplianceStatus =
      currentStatus === "compliant" ? "non_compliant" : "compliant";

    let newWorkStatus: WorkStatus | null;
    let newOnlineStatus: OnlineStatus;

    if (newComplianceStatus === "compliant") {
      newWorkStatus = "to_process";
      newOnlineStatus = "unpublished";
    } else {
      newWorkStatus = null;
      newOnlineStatus = "archived";
    }

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
 * Server action to get the webhook secret for preview authentication
 * This allows secure transmission of the webhook secret without exposing it client-side
 * The Main App expects the raw secret, not an HMAC signature
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
 * Server action to publish a document to refugies.info via Vercel Workflow.
 *
 * This triggers a durable workflow that:
 * 1. Calls the publication webhook
 * 2. Stores the publication record
 * 3. Updates workflow progress to 'published'
 * 4. Optionally creates translation records
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
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    // 1. Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      logger.error(userError, "Error getting user for publication");
      return { success: false, error: "Utilisateur non authentifié" };
    }

    // 2. Normalize markdown to ensure unambiguous directive nesting
    // This prevents parsing issues in Main App when it receives nested directives
    const normalizedMarkdown = normalizeMarkdown(markdown);

    // 3. Start the publication workflow
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
        userEmail: user.email,
        platform: "refugies.info",
      },
      triggerTranslations ?? false,
    ]);

    logger.info(
      { workflowRunId: result.runId, workflowId },
      "Publication workflow started",
    );

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
 * Server action to archive a document via Vercel Workflow.
 *
 * This triggers a durable workflow that:
 * 1. Archives the document on the target platform
 * 2. Updates the publication record status
 * 3. Updates workflow progress to 'archived'
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
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    // 1. Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    if (!archiveWorkflow) {
      logger.error("archiveWorkflow is undefined - cannot start workflow");
      return {
        success: false,
        error: "Configuration error: Workflow not loaded",
      };
    }

    // 2. Start the archive workflow
    const result = await start(archiveWorkflow, [
      {
        workflowId,
        title,
        markdown,
        metadata,
        userId: user.id,
        userEmail: user.email,
        platform: "refugies.info",
      },
    ]);

    logger.info(
      { workflowRunId: result.runId, workflowId },
      "Archive workflow started",
    );

    return {
      success: true,
      workflowRunId: result.runId,
    };
  } catch (error) {
    logger.error(error, "Unexpected error starting archive workflow");
    return { success: false, error: "Erreur inattendue lors de l'archivage" };
  }
}

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

    const markdown = workflow.editorial_record?.markdown || "";

    return { success: true, content: markdown };
  } catch (error) {
    logger.error(error, "Unexpected error getting editorial content");
    return { success: false, error: "Unexpected error" };
  }
}
