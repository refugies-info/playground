/**
 * @file pipelines/ingestion/force-arbitration.ts
 *
 * Workflow for manual retry/arbitration of a single DI record.
 * Runs audit then metadata for a specific workflowId when the audit result is compliant.
 */

import { forceAuditReportStep } from "../../steps/ingestion/audit-di-step";
import { forceMetadataReportStep } from "../../steps/ingestion/metadata-di-step";

export async function forceArbitrationWorkflow(workflowId: string) {
  "use workflow";

  // 1. Audit
  const auditResult = await forceAuditReportStep(workflowId);

  // 2. Metadata (only if audit succeeded and the record is compliant)
  let metadataResult:
    | Awaited<ReturnType<typeof forceMetadataReportStep>>
    | undefined;
  if (auditResult.success && auditResult.complianceStatus === "compliant") {
    metadataResult = await forceMetadataReportStep(workflowId);
  }

  return {
    audit: auditResult,
    metadata: metadataResult,
  };
}
