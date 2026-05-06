// =============================================================================
// Types
// =============================================================================

export type { ForceEditorialWorkflowResult } from "./pipelines/editorial/force-editorial";
export { forceEditorialWorkflow } from "./pipelines/editorial/force-editorial";
export type { PersistEditorialWorkflowResult } from "./pipelines/editorial/persist-editorial";
export { persistEditorialWorkflow } from "./pipelines/editorial/persist-editorial";
export type { PersistMetadataWorkflowResult } from "./pipelines/editorial/persist-metadata";
export { persistMetadataWorkflow } from "./pipelines/editorial/persist-metadata";
export type { SaveWorkflowResult } from "./pipelines/editorial/save";
export { saveWorkflow } from "./pipelines/editorial/save";
export type { ToggleStatusResult } from "./pipelines/editorial/toggle-status";
export { toggleStatusWorkflow } from "./pipelines/editorial/toggle-status";
// =============================================================================
// Pipelines - Ingestion
// =============================================================================
export { diIngestionWorkflow } from "./pipelines/ingestion/di-ingestion";
export { diSingleRecordWorkflow } from "./pipelines/ingestion/di-single-record";
export { forceArbitrationWorkflow } from "./pipelines/ingestion/force-arbitration";
export { forceMetadataOnlyWorkflow } from "./pipelines/ingestion/force-metadata-only";
// =============================================================================
// Pipelines - Editorial
// =============================================================================
export type { ArchiveWorkflowResult } from "./pipelines/publication/archive";
export { archiveWorkflow } from "./pipelines/publication/archive";
export type { PublicationWorkflowResult } from "./pipelines/publication/publication";
export { publicationWorkflow } from "./pipelines/publication/publication";
export type { TranslationPublicationWorkflowResult } from "./pipelines/publication/translation-publication";
export { translationPublicationWorkflow } from "./pipelines/publication/translation-publication";
// =============================================================================
// Pipelines - Translation
// =============================================================================
export type {
  GenerateTranslationWorkflowInput,
  GenerateTranslationWorkflowResult,
} from "./pipelines/translation/generate-translation";
export {
  generateTranslationWorkflow,
  generateTranslationWorkflowAr,
  generateTranslationWorkflowEn,
  generateTranslationWorkflowFa,
  generateTranslationWorkflowPashto,
  generateTranslationWorkflowRu,
  generateTranslationWorkflowUk,
} from "./pipelines/translation/generate-translation";
export { LANGUAGE_WORKFLOWS } from "./pipelines/workflow-registry";
export type { GetEditorialRecordIdResult } from "./steps/common/get-editorial-record-id";
export { getEditorialRecordIdStep } from "./steps/common/get-editorial-record-id";
// =============================================================================
// Common Utilities
// =============================================================================
export { getSupabaseClient } from "./steps/common/supabase";
export type { ForceEditorialStepResult } from "./steps/editorial/force-editorial-step";
export type { PersistEditorialReportResult } from "./steps/editorial/persist-editorial-report";
export { persistEditorialReportStep } from "./steps/editorial/persist-editorial-report";
export type { PersistMetadataReportResult } from "./steps/editorial/persist-metadata-report";
export { persistMetadataReportStep } from "./steps/editorial/persist-metadata-report";
export type { SaveDocumentResult } from "./steps/editorial/save-document";
// =============================================================================
// Steps - Editorial
// =============================================================================
export { saveDocumentStep } from "./steps/editorial/save-document";
// =============================================================================
// Steps - Ingestion
// =============================================================================
export * from "./steps/ingestion/audit-di-step";
export {
  claimDiAuditTargetsStep,
  diSingleAuditStep,
  diSingleMetadataStep,
  fanOutDiRecordsStep,
} from "./steps/ingestion/di-single-record-steps";
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
export * from "./types";
