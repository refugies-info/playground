import { addTradToAirtableStep } from "../../steps/translation/add-trad-to-airtable";
import { assignTranslatorStep } from "../../steps/translation/assign-translator";
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

  const pendingResult = await updateTranslationStatusStep(
    editorialRecordId,
    language,
    "pending",
  );
  // RI-1430 — `updateTranslationStatusStep` ne réussit que si l'enregistrement
  // existe déjà, donc `pendingResult.success` distingue naturellement les deux
  // cas : une régénération manuelle sur une traduction existante (peu importe
  // son statut précédent) doit finir sur "draft" (en cours) — jamais repartir
  // dans la file d'attente "à traiter". La toute première génération (le
  // record n'existe pas encore, créé plus loin par generateTranslationStep)
  // reste "to_process", comme avant.
  const isRegeneration = pendingResult.success;

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
      isRegeneration ? "draft" : "to_process",
    );
    await assignTranslatorStep(result.data.translationRecordId, language);
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
