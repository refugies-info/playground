import { addTradToAirtableStep } from "../../steps/translation/add-trad-to-airtable";
import {
  type GenerateTranslationResult,
  generateTranslationStep,
} from "../../steps/translation/generate-translation";
import { updateTranslationStatusStep } from "../../steps/translation/update-status";

export interface GenerateTranslationWorkflowInput {
  editorialRecordId: string;
  language: string;
  parentWorkflowId: string;
  userId?: string;
}

export type GenerateTranslationWorkflowResult = GenerateTranslationResult;

export async function generateTranslationWorkflow(
  input: GenerateTranslationWorkflowInput,
): Promise<GenerateTranslationWorkflowResult> {
  "use workflow";

  const { editorialRecordId, language, parentWorkflowId, userId } = input;

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

    await updateTranslationStatusStep(
      editorialRecordId,
      language,
      "to_process",
    );
    await addTradToAirtableStep(editorialRecordId, language, userId);

    return result.data;
  } catch (error) {
    await updateTranslationStatusStep(editorialRecordId, language, "error");
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
