import type { WorkStatus } from "@playground/shared-types";
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

// Statuts humains qu'il est légitime de restaurer après régénération —
// "pending" (transitoire) et "error" (échec précédent) n'en font pas partie.
const RESTORABLE_STATUSES: WorkStatus[] = ["to_process", "draft", "to_review"];

function isRestorableStatus(
  status: string | null | undefined,
): status is WorkStatus {
  return RESTORABLE_STATUSES.includes(status as WorkStatus);
}

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
  // RI-1430 — une régénération manuelle sur une traduction déjà prise en main
  // (ex. "draft"/en cours) ne doit pas la remettre dans la file d'attente
  // "à traiter" : on restaure le statut qu'elle avait juste avant. Une toute
  // première génération (pas de statut humain préexistant) retombe sur
  // "to_process", comme avant.
  const previousStatus = pendingResult.success
    ? pendingResult.data?.previousStatus
    : undefined;

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
      isRestorableStatus(previousStatus) ? previousStatus : "to_process",
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
