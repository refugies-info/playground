/**
 * @file steps/editorial/force-editorial-step.ts
 *
 * Workflow step: AI-powered content rewrite for a document.
 *
 * Runs inside a durable Vercel Workflow step — no SSE, no client timeouts.
 * The Letta agent can take as long as it needs (1–3 minutes is normal).
 *
 * Flow:
 *   1. Validate/recreate Letta conversation
 *   2. Cancel any active runs on the conversation
 *   3. Fetch content + metadata (editorial_record → ingestion_record fallback)
 *   4. Call simplifyContent() — collect full response server-side
 *   5. Persist via persistEditorialReportStep
 *   6. Return the rewritten content
 */

import { createLettaClient, simplifyContentSync } from "@playground/agents";
import { logger } from "@playground/shared-types";
import matter from "gray-matter";
import { FatalError } from "workflow";
import { getSupabaseClient } from "../common/supabase";
import {
  type PersistEditorialReportResult,
  persistEditorialReportStep,
} from "./persist-editorial-report";

// Conversation ID validation pattern (UUID v4 with conv- prefix)
const CONV_ID_PATTERN =
  /^conv-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export interface ForceEditorialStepResult {
  /** The rewritten markdown content from the AI agent */
  content: string;
  /** Result from the persistence step */
  persistResult: PersistEditorialReportResult;
}

/**
 * Durable workflow step that calls the Letta editorial agent and persists the result.
 *
 * Unlike the old SSE route, this step:
 * - Has no timeout pressure (Vercel Workflow steps can run for minutes)
 * - Automatically retries on transient failures
 * - Always persists the result, even if the client disconnects
 *
 * @param workflowId - The workflow (document) ID
 */
export async function forceEditorialStep(
  workflowId: string,
): Promise<ForceEditorialStepResult> {
  "use step";

  const supabase = getSupabaseClient();

  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new FatalError("PLAYGROUND_AGENT_ID is not defined");
  }

  // ─── 1. Fetch workflow ────────────────────────────────────────────────
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("conversation_id, editorial_record_id, ingestion_record_id")
    .eq("id", workflowId)
    .single();

  if (workflowError || !workflow) {
    throw new FatalError(
      `Workflow not found: ${workflowError?.message ?? "no data"}`,
    );
  }

  // ─── 2. Validate / create conversation ────────────────────────────────
  let conversationId = workflow.conversation_id?.replace(/"/g, "") || null;

  if (conversationId && !CONV_ID_PATTERN.test(conversationId)) {
    logger.warn(
      { workflowId, conversationId },
      "[forceEditorialStep] Invalid conversation_id — recreating",
    );
    conversationId = null;
  }

  const lettaClient = createLettaClient();

  if (!conversationId) {
    logger.info({ workflowId }, "[forceEditorialStep] Creating conversation");
    const conversation = await lettaClient.conversations.create({
      agent_id: agentId,
    });
    conversationId = conversation.id;

    await supabase
      .from("workflows")
      .update({ conversation_id: conversationId })
      .eq("id", workflowId);

    logger.info(
      { workflowId, conversationId },
      "[forceEditorialStep] Conversation created and linked",
    );
  }

  // ─── 3. Cancel active runs ────────────────────────────────────────────
  try {
    await lettaClient.conversations.cancel(conversationId);
    logger.info(
      { workflowId, conversationId },
      "[forceEditorialStep] Cancelled active runs",
    );
  } catch (cancelError) {
    // biome-ignore lint/suspicious/noExplicitAny: Letta SDK error shape is untyped
    const detail = (cancelError as any)?.error?.detail ?? "";
    const isNoActiveRuns =
      typeof detail === "string" && detail.includes("No active runs");
    if (!isNoActiveRuns) {
      logger.warn(
        { error: cancelError, workflowId },
        "[forceEditorialStep] Cancel failed (non-blocking)",
      );
    }
  }

  // ─── 4. Fetch content + metadata ──────────────────────────────────────
  let editorialContent: string | null = null;
  let metadata: Record<string, unknown> | null = null;

  // Try editorial_record first
  if (workflow.editorial_record_id) {
    const { data: record } = await supabase
      .from("editorial_records")
      .select("markdown, metadata")
      .eq("id", workflow.editorial_record_id)
      .single();

    if (record) {
      editorialContent = record.markdown;
      if (record.metadata && typeof record.metadata === "object") {
        metadata = record.metadata as Record<string, unknown>;
      }
    }
  }

  // Fallback to ingestion_record
  if (!editorialContent && workflow.ingestion_record_id) {
    const { data: record } = await supabase
      .from("ingestion_records")
      .select("markdown, metadata")
      .eq("id", workflow.ingestion_record_id)
      .single();

    if (record) {
      editorialContent = record.markdown;
      if (!metadata && record.metadata && typeof record.metadata === "object") {
        metadata = record.metadata as Record<string, unknown>;
      }
    }
  }

  if (!editorialContent) {
    throw new FatalError(
      `No content found for workflow ${workflowId} (no editorial or ingestion record)`,
    );
  }

  // Build full content with frontmatter
  const fullContent = metadata
    ? matter.stringify(editorialContent, metadata)
    : editorialContent;

  // ─── 5. Call Letta agent ──────────────────────────────────────────────
  logger.info(
    { workflowId, conversationId, contentLength: fullContent.length },
    "[forceEditorialStep] Starting Letta rewrite",
  );

  // Non-streaming call — waits for the full response from Letta.
  // No chunks, no pings, no timeout management. Simple and robust.
  const finalContent = await simplifyContentSync(
    lettaClient,
    fullContent,
    conversationId,
  );

  if (!finalContent) {
    throw new Error("No assistant response received from Letta agent");
  }

  // ─── 6. Persist ───────────────────────────────────────────────────────
  const persistResult = await persistEditorialReportStep(
    workflowId,
    agentId,
    finalContent,
  );

  if (!persistResult.success || !persistResult.data) {
    throw new Error(
      persistResult.error || "Failed to persist editorial report",
    );
  }

  logger.info(
    {
      workflowId,
      reportId: persistResult.data.reportId,
      editorialRecordId: persistResult.data.editorialRecordId,
    },
    "[forceEditorialStep] Editorial report persisted",
  );

  return {
    content: finalContent,
    persistResult: persistResult.data,
  };
}

// Allow retries for transient Letta Cloud failures
forceEditorialStep.maxRetries = 2;
