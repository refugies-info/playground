import { logger } from "@playground/shared-types";
import { start } from "workflow/api";
import {
  generateTranslationWorkflow,
  generateTranslationWorkflowAr,
  generateTranslationWorkflowEn,
  generateTranslationWorkflowFa,
  generateTranslationWorkflowPashto,
  generateTranslationWorkflowRu,
  generateTranslationWorkflowUk,
} from "../../pipelines/generate-translation";
import type { StepResult } from "../../types";

const LANGUAGE_WORKFLOWS: Record<string, typeof generateTranslationWorkflow> = {
  ar: generateTranslationWorkflowAr,
  en: generateTranslationWorkflowEn,
  fa: generateTranslationWorkflowFa,
  ps: generateTranslationWorkflowPashto,
  ru: generateTranslationWorkflowRu,
  uk: generateTranslationWorkflowUk,
};

/**
 * Result of triggering the translation workflow..
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
 * @returns Result indicating if the workflow was triggered
 */
export async function triggerTranslationWorkflowStep(
  editorialRecordId: string,
  language: string,
  parentWorkflowId: string,
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
    // We return success: false here so the parent workflow knows it failed to trigger
    // It can decide whether to fail completely or just log it (Promise.allSettled usage suggestions otherwise)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
