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
  // Computed work_status: explicit value ?? terminal-state guard ?? compliance fallback
  const computedWorkStatus: WorkStatus | null =
    erWorkStatus ??
    (erOnlineStatus === "published" || erOnlineStatus === "archived"
      ? null // terminal state: published/archived docs have no pending work
      : complianceStatus === "compliant"
        ? "to_process"
        : null);

  // Computed online_status: explicit value ?? compliance fallback
  const computedOnlineStatus: OnlineStatus | null =
    erOnlineStatus ??
    (complianceStatus === "non_compliant" ? "archived" : null);

  return { computedWorkStatus, computedOnlineStatus };
}
