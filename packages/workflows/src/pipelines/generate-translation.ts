/**
 * FLOW DIAGRAM:
 *
 * ┌───────────────────────────────┐
 * │  generateTranslationWorkflow  │
 * └───────────────┬───────────────┘
 *                 │
 *     ┌───────────▼───────────┐
 *     │ updateStatus(pending) │
 *     └───────────┬───────────┘
 *                 │
 *         ┌───────▼───────┐
 *         │      TRY      │
 *         └───────┬───────┘
 *                 │
 *     ┌───────────▼───────────┐
 *     │  generateTranslation  │
 *     └───────────┬───────────┘
 *                 │
 *         ┌───────┴───────┐
 *     SUCCESS           FAILURE
 *         │               │
 * ┌───────▼───────┐ ┌─────▼───────┐
 * │ updateStatus  │ │ updateStatus│
 * │ (to_process)  │ │   (error)   │
 * └───────┬───────┘ └─────┬───────┘
 *         │               │
 * ┌───────▼───────┐       │
 * │ addTrad       │       │
 * │ ToAirtable    │       │
 * │ (non-blocking)│       │
 * └───────┬───────┘       │
 *         ▼               ▼
 *        END            THROW
 */

import { addTradToAirtableStep } from "../steps/translation/add-trad-to-airtable";
import {
  type GenerateTranslationResult,
  generateTranslationStep,
} from "../steps/translation/generate-translation";
import { updateTranslationStatusStep } from "../steps/translation/update-status";

/**
 * Input for the generate translation workflow.
 */
export interface GenerateTranslationWorkflowInput {
  editorialRecordId: string;
  language: string;
  parentWorkflowId: string;
  /** User ID of the person who triggered the translation (used for Airtable billing). */
  userId?: string;
}

export type GenerateTranslationWorkflowResult = GenerateTranslationResult;

/**
 * Workflow to generate a translation for a specific language.
 *
 * This workflow is intended to be triggered asynchronously from the publication workflow.
 *
 * @param input - The input parameters
 */
export async function generateTranslationWorkflow(
  input: GenerateTranslationWorkflowInput,
): Promise<GenerateTranslationWorkflowResult> {
  "use workflow";

  const { editorialRecordId, language, parentWorkflowId, userId } = input;

  // 1. Set status to pending via step
  await updateTranslationStatusStep(editorialRecordId, language, "pending");

  try {
    const result = await generateTranslationStep(
      editorialRecordId,
      language,
      parentWorkflowId,
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || "Translation generation failed");
    }

    // 2. Set status to to_process on success via step
    await updateTranslationStatusStep(
      editorialRecordId,
      language,
      "to_process",
    );

    // 3. Track translation in Airtable for billing (non-blocking)
    await addTradToAirtableStep(editorialRecordId, language, userId);

    return result.data;
  } catch (error) {
    // 3. Set status to error on failure via step
    await updateTranslationStatusStep(editorialRecordId, language, "error");

    // Re-throw to ensure workflow fails
    throw error;
  }
}

export async function generateTranslationWorkflowAr(
  input: GenerateTranslationWorkflowInput,
): Promise<GenerateTranslationWorkflowResult> {
  "use workflow";
  return generateTranslationWorkflow(input);
}

export async function generateTranslationWorkflowEn(
  input: GenerateTranslationWorkflowInput,
): Promise<GenerateTranslationWorkflowResult> {
  "use workflow";
  return generateTranslationWorkflow(input);
}

export async function generateTranslationWorkflowRu(
  input: GenerateTranslationWorkflowInput,
): Promise<GenerateTranslationWorkflowResult> {
  "use workflow";
  return generateTranslationWorkflow(input);
}

export async function generateTranslationWorkflowUk(
  input: GenerateTranslationWorkflowInput,
): Promise<GenerateTranslationWorkflowResult> {
  "use workflow";
  return generateTranslationWorkflow(input);
}

export async function generateTranslationWorkflowFa(
  input: GenerateTranslationWorkflowInput,
): Promise<GenerateTranslationWorkflowResult> {
  "use workflow";
  return generateTranslationWorkflow(input);
}

export async function generateTranslationWorkflowPashto(
  input: GenerateTranslationWorkflowInput,
): Promise<GenerateTranslationWorkflowResult> {
  "use workflow";
  return generateTranslationWorkflow(input);
}
