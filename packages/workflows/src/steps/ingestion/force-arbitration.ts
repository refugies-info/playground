import { forceAuditReportStep } from "./audit-di-step";
import { forceMetadataReportStep } from "./metadata-di-step";

/**
 * Main forced arbitration workflow.
 *
 * Orchestrates forced audit generation and then metadata generation
 * for a specific workflow (used for manual retry/arbitration).
 * Behaves similarly to diIngestionWorkflow but for a single record.
 */
export async function forceArbitrationWorkflow(workflowId: string) {
  "use workflow";

  // 1. Audit
  const auditResult = await forceAuditReportStep(workflowId);

  // 2. Metadata (only if audit succeeded)
  let metadataResult:
    | Awaited<ReturnType<typeof forceMetadataReportStep>>
    | undefined;
  if (auditResult.success) {
    metadataResult = await forceMetadataReportStep(workflowId);
  }

  return {
    audit: auditResult,
    metadata: metadataResult,
  };
}
