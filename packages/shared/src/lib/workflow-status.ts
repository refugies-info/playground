import type {
  ComplianceStatus,
  OnlineStatus,
  WorkStatus,
} from "../types/document";

export type ComputedWorkflowStatuses = {
  computedWorkStatus: WorkStatus | null;
  computedOnlineStatus: OnlineStatus | null;
};

/**
 * Computes display statuses for a workflow based on ingestion compliance
 * and editorial record statuses.
 *
 * Mirrors the SQL logic in the `workflows_enriched` view.
 *
 * Rules for computedWorkStatus:
 *   1. Use er.work_status if explicitly set
 *   2. If online_status is a terminal state (published/archived), return null
 *      — a published or archived document has no pending work (RI-1128)
 *   3. If compliance_status is 'compliant' → 'to_process' (default for new compliant docs)
 *   4. Otherwise null
 *
 * Rules for computedOnlineStatus:
 *   1. Use er.online_status if explicitly set
 *   2. If compliance_status is 'non_compliant' → 'archived' (default)
 *   3. Otherwise null
 */
export function computeWorkflowStatuses(
  complianceStatus: ComplianceStatus | null,
  erWorkStatus: WorkStatus | null,
  erOnlineStatus: OnlineStatus | null,
): ComputedWorkflowStatuses {
  // Computed work_status
  let computedWorkStatus: WorkStatus | null = null;
  if (erWorkStatus !== null) {
    computedWorkStatus = erWorkStatus;
  } else if (erOnlineStatus === "published" || erOnlineStatus === "archived") {
    // Terminal state: published/archived documents have no pending work
    computedWorkStatus = null;
  } else if (complianceStatus === "compliant") {
    computedWorkStatus = "to_process";
  }

  // Computed online_status
  let computedOnlineStatus: OnlineStatus | null = null;
  if (erOnlineStatus !== null) {
    computedOnlineStatus = erOnlineStatus;
  } else if (complianceStatus === "non_compliant") {
    computedOnlineStatus = "archived";
  }

  return { computedWorkStatus, computedOnlineStatus };
}
