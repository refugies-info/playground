// =============================================================================
// Types
// =============================================================================
export * from "./types";

// =============================================================================
// Pipelines (Orchestrators - "use workflow")
// =============================================================================
import {
  type ArchiveWorkflowResult,
  archiveWorkflow,
} from "./pipelines/archive";
export { archiveWorkflow, type ArchiveWorkflowResult };

import {
  type PublicationWorkflowResult,
  publicationWorkflow,
} from "./pipelines/publication";
export { publicationWorkflow, type PublicationWorkflowResult };

import {
  type TranslationPublicationWorkflowResult,
  translationPublicationWorkflow,
} from "./pipelines/translation-publication";
export {
  translationPublicationWorkflow,
  type TranslationPublicationWorkflowResult,
};

import { type SaveWorkflowResult, saveWorkflow } from "./pipelines/save";
export { saveWorkflow, type SaveWorkflowResult };

import {
  type PersistEditorialWorkflowResult,
  persistEditorialWorkflow,
} from "./pipelines/persist-editorial";
export { persistEditorialWorkflow, type PersistEditorialWorkflowResult };

import {
  type PersistMetadataWorkflowResult,
  persistMetadataWorkflow,
} from "./pipelines/persist-metadata";
export { persistMetadataWorkflow, type PersistMetadataWorkflowResult };

import {
  type ToggleStatusResult,
  toggleStatusWorkflow,
} from "./pipelines/toggle-status";
export { toggleStatusWorkflow, type ToggleStatusResult };

import {
  type GenerateTranslationWorkflowInput,
  type GenerateTranslationWorkflowResult,
  generateTranslationWorkflow,
} from "./pipelines/generate-translation";
export {
  generateTranslationWorkflow,
  type GenerateTranslationWorkflowInput,
  type GenerateTranslationWorkflowResult,
};

export { LANGUAGE_WORKFLOWS } from "./pipelines/workflow-registry";

export type { GetEditorialRecordIdResult } from "./steps/common/get-editorial-record-id";
export { getEditorialRecordIdStep } from "./steps/common/get-editorial-record-id";

// =============================================================================
// Common Utilities
// =============================================================================
export { getSupabaseClient } from "./steps/common/supabase";
export type { PersistEditorialReportResult } from "./steps/editorial/persist-editorial-report";
export { persistEditorialReportStep } from "./steps/editorial/persist-editorial-report";
export type { PersistMetadataReportResult } from "./steps/editorial/persist-metadata-report";
export { persistMetadataReportStep } from "./steps/editorial/persist-metadata-report";
export type { SaveDocumentResult } from "./steps/editorial/save-document";
// =============================================================================
// Steps - Editorial
// =============================================================================
export { saveDocumentStep } from "./steps/editorial/save-document";
export * from "./steps/ingestion/audit-di-step";
export { forceArbitrationWorkflow } from "./steps/ingestion/force-arbitration";
// =============================================================================
// Steps - Ingestion
// =============================================================================
export * from "./steps/ingestion/ingest-di";
export * from "./steps/ingestion/metadata-di-step";

// =============================================================================
// Adapters - Platform implementations
// =============================================================================
export {
  getPublisherAdapter,
  refugiesInfoAdapter,
} from "./steps/publication/adapters/refugies-info";
export type {
  PublisherAdapter,
  WebhookPayload,
  WebhookResponse,
} from "./steps/publication/adapters/types";
export type {
  ArchiveDocumentInput,
  ArchiveDocumentResult,
} from "./steps/publication/archive-document";
export { archiveDocumentStep } from "./steps/publication/archive-document";
export type {
  PublishDocumentInput,
  PublishDocumentResult,
} from "./steps/publication/publish-document";
// =============================================================================
// Steps - Publication
// =============================================================================
export { publishDocumentStep } from "./steps/publication/publish-document";
export type {
  PublishTranslationInput,
  PublishTranslationResult,
} from "./steps/publication/publish-translation";
export { publishTranslationStep } from "./steps/publication/publish-translation";
// =============================================================================
// Steps - Translation
// =============================================================================
export type { AddTradToAirtableResult } from "./steps/translation/add-trad-to-airtable";
export { addTradToAirtableStep } from "./steps/translation/add-trad-to-airtable";
export type { CreateTranslationRecordsResult } from "./steps/translation/create-translation-records";
export { createTranslationRecordsStep } from "./steps/translation/create-translation-records";
export { generateTranslationStep } from "./steps/translation/generate-translation";
export { triggerTranslationWorkflowStep } from "./steps/translation/trigger-translation-workflow";
export { updateTranslationStatusStep } from "./steps/translation/update-status";
