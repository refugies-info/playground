/**
 * @file pipelines/ingestion/di-single-record.ts
 *
 * Child workflow: processes a single DI record end-to-end.
 * Runs audit → metadata sequentially so every record gets both
 * reports at roughly the same time. All records run in parallel
 * (each spawned independently by fanOutDiRecordsStep).
 */

import {
  diSingleAuditStep,
  diSingleMetadataStep,
} from "../../steps/ingestion/di-single-record-steps";

export async function diSingleRecordWorkflow(
  ingestionRecordId: string,
  workflowId: string,
  markdown: string,
) {
  "use workflow";

  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log(
    `▶ diSingleRecordWorkflow started for record ${ingestionRecordId}`,
  );

  // 1. Audit (sets compliance_status + ingestion_report_id)
  const auditResult = await diSingleAuditStep(
    ingestionRecordId,
    workflowId,
    markdown,
  );

  // 2. Metadata — always runs, regardless of compliance_status
  await diSingleMetadataStep(ingestionRecordId, workflowId, markdown);

  // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
  console.log(
    `✔ diSingleRecordWorkflow complete — record ${ingestionRecordId} (${auditResult.complianceStatus})`,
  );

  return {
    ingestionRecordId,
    workflowId,
    complianceStatus: auditResult.complianceStatus,
  };
}
