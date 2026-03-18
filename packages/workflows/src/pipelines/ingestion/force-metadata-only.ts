/**
 * @file pipelines/ingestion/force-metadata-only.ts
 *
 * Workflow for manual re-generation of a metadata report for a single record.
 * Unlike forceArbitrationWorkflow, this skips the audit step entirely.
 * Used after re-training the metadata AI agent (Agathe).
 */

import { forceMetadataReportStep } from "../../steps/ingestion/metadata-di-step";

export async function forceMetadataOnlyWorkflow(workflowId: string) {
  "use workflow";

  const metadataResult = await forceMetadataReportStep(workflowId);

  return { metadata: metadataResult };
}
