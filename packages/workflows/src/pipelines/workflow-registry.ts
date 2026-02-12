/**
 * Registry mapping language codes to their workflow functions.
 *
 * This file exists separately from generate-translation.ts to avoid
 * circular dependencies when steps need to reference pipeline workflows.
 * (pipelines import steps, steps should NOT import pipelines directly)
 */
import {
  generateTranslationWorkflow,
  generateTranslationWorkflowAr,
  generateTranslationWorkflowEn,
  generateTranslationWorkflowFa,
  generateTranslationWorkflowPashto,
  generateTranslationWorkflowRu,
  generateTranslationWorkflowUk,
} from "./generate-translation";

export const LANGUAGE_WORKFLOWS: Record<
  string,
  typeof generateTranslationWorkflow
> = {
  ar: generateTranslationWorkflowAr,
  en: generateTranslationWorkflowEn,
  fa: generateTranslationWorkflowFa,
  ps: generateTranslationWorkflowPashto,
  ru: generateTranslationWorkflowRu,
  uk: generateTranslationWorkflowUk,
};

export { generateTranslationWorkflow };
