/**
 * @file pipelines/editorial/force-editorial.ts
 *
 * Workflow for AI-powered content rewrite of a single document.
 * Replaces the old SSE-based streaming route with a durable workflow.
 *
 * The step handles: conversation management, Letta agent call, persistence.
 */

import {
  type ForceEditorialStepResult,
  forceEditorialStep,
} from "../../steps/editorial/force-editorial-step";

export async function forceEditorialWorkflow(
  workflowId: string,
): Promise<ForceEditorialStepResult> {
  "use workflow";

  return await forceEditorialStep(workflowId);
}
