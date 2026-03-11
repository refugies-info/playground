import { describe, expect, it } from "vitest";
import { computeWorkflowStatuses } from "../src/lib/workflow-status";

/**
 * Tests for RI-1128: invalid status combinations.
 *
 * Invalid combinations identified in production:
 *   - online_status='published' AND work_status='to_process'  (impossible)
 *   - online_status='archived'  AND work_status='to_process'  (impossible)
 *
 * Root cause: the workflows_enriched view fallback logic did not account for
 * terminal online_status values when computing work_status.
 */
describe("computeWorkflowStatuses", () => {
  // === Bug reproductions (RI-1128) ===

  it("published document should NOT have work_status=to_process", () => {
    // Scenario: document published → work_status cleared, online_status='published'
    // compliance_status remains 'compliant' after publish
    const result = computeWorkflowStatuses("compliant", null, "published");
    expect(result.computedWorkStatus).toBeNull();
    expect(result.computedOnlineStatus).toBe("published");
  });

  it("archived document should NOT have work_status=to_process", () => {
    // Scenario: document archived → work_status cleared, online_status='archived'
    // compliance_status remains 'compliant' after archival
    const result = computeWorkflowStatuses("compliant", null, "archived");
    expect(result.computedWorkStatus).toBeNull();
    expect(result.computedOnlineStatus).toBe("archived");
  });

  // === Valid combinations ===

  it("compliant doc with no editorial record → to_process / null online", () => {
    const result = computeWorkflowStatuses("compliant", null, null);
    expect(result.computedWorkStatus).toBe("to_process");
    expect(result.computedOnlineStatus).toBeNull();
  });

  it("non_compliant doc with no editorial record → null work / archived", () => {
    const result = computeWorkflowStatuses("non_compliant", null, null);
    expect(result.computedWorkStatus).toBeNull();
    expect(result.computedOnlineStatus).toBe("archived");
  });

  it("editorial work_status takes priority over compliance fallback", () => {
    const result = computeWorkflowStatuses("compliant", "draft", "unpublished");
    expect(result.computedWorkStatus).toBe("draft");
    expect(result.computedOnlineStatus).toBe("unpublished");
  });

  it("editorial online_status takes priority over non_compliant fallback", () => {
    const result = computeWorkflowStatuses(
      "non_compliant",
      null,
      "unpublished",
    );
    expect(result.computedOnlineStatus).toBe("unpublished");
  });

  it("pending compliance returns null for both computed statuses", () => {
    const result = computeWorkflowStatuses("pending", null, null);
    expect(result.computedWorkStatus).toBeNull();
    expect(result.computedOnlineStatus).toBeNull();
  });

  it("null compliance returns null for both computed statuses", () => {
    const result = computeWorkflowStatuses(null, null, null);
    expect(result.computedWorkStatus).toBeNull();
    expect(result.computedOnlineStatus).toBeNull();
  });

  it("draft document stays in draft even when compliant", () => {
    const result = computeWorkflowStatuses("compliant", "draft", null);
    expect(result.computedWorkStatus).toBe("draft");
    expect(result.computedOnlineStatus).toBeNull();
  });
});
