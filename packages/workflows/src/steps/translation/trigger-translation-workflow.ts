import { logger } from "@playground/shared-types";
import { start } from "workflow/api";
import {
  generateTranslationWorkflow,
  LANGUAGE_WORKFLOWS,
} from "../../pipelines/workflow-registry";
import type { StepResult } from "../../types";

/**
 * Result of triggering the translation workflow.
 */
export interface TriggerTranslationWorkflowResult {
  triggered: boolean;
  runId?: string;
}

/**
 * Triggers the translation generation workflow for a specific language.
 *
 * This step uses the workflow API to start a new workflow execution asynchronously.
 * This allows the parent workflow (publication) to continue/finish without waiting
 * for the potentially long-running translation process.
 *
 * @param editorialRecordId - The source editorial record ID
 * @param language - The target language code
 * @param parentWorkflowId - The ID of the parent workflow (for tracking)
 * @param userId - The user ID of the person who triggered the translation
 * @returns Result indicating if the workflow was triggered
 */
export async function triggerTranslationWorkflowStep(
  editorialRecordId: string,
  language: string,
  parentWorkflowId: string,
  userId?: string,
): Promise<StepResult<TriggerTranslationWorkflowResult>> {
  "use step";

  try {
    const workflow =
      LANGUAGE_WORKFLOWS[language] || generateTranslationWorkflow;
    const run = await start(workflow, [
      {
        editorialRecordId,
        language,
        parentWorkflowId,
        userId,
      },
    ]);

    logger.info(
      {
        parentWorkflowId,
        editorialRecordId,
        language,
        childRunId: run.runId,
      },
      "Triggered translation workflow",
    );

    return {
      success: true,
      data: {
        triggered: true,
        runId: run.runId,
      },
    };
  } catch (error) {
    logger.error(
      { error, parentWorkflowId, language },
      "Failed to trigger translation workflow",
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
