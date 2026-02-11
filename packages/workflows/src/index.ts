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

import { conformityAuditWorkflow } from "./pipelines/conformity-audit";
export { conformityAuditWorkflow };

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
export { forceArbitrationWorkflow } from "./steps/ingestion/force-arbitration";
// =============================================================================
// Steps - Ingestion
// =============================================================================
export * from "./steps/ingestion/ingest-di";

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
export type { CreateTranslationRecordsResult } from "./steps/translation/create-translation-records";
// =============================================================================
// Steps - Translation
// =============================================================================
export { createTranslationRecordsStep } from "./steps/translation/create-translation-records";
