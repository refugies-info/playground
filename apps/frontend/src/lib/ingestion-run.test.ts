import { describe, expect, it } from "vitest";
import { mapIngestionRunSummary } from "./ingestion-run";

const row = {
  id: "run-1",
  source: "rco",
  status: "interrupted",
  created_at: "2026-09-28T08:00:00Z",
  completed_at: "2026-09-28T08:05:00Z",
  options: { dryRun: true },
  total_fetched: 30,
  total_inserted: 2,
  total_updated: 5,
  total_unchanged: 20,
  total_errors: 1,
  checkpoint: {
    numeroActions: ["A", "B", "C", "D"],
    nextIndex: 3,
    totals: {
      missing: 1,
      changes: {
        new: 2,
        unchanged: 20,
        baseline: 3,
        sessions_only: 1,
        content: 1,
      },
      structuresWritten: 4,
      ingestionRecordsCreated: 3,
      errors: [{ numeroAction: "B", error: "boom" }],
    },
  },
};

describe("mapIngestionRunSummary", () => {
  it("exposes RCO progress and change breakdown from the checkpoint", () => {
    expect(mapIngestionRunSummary(row)).toEqual({
      id: "run-1",
      source: "rco",
      status: "interrupted",
      dryRun: true,
      createdAt: "2026-09-28T08:00:00Z",
      completedAt: "2026-09-28T08:05:00Z",
      progress: { processed: 3, total: 4 },
      counts: {
        fetched: 30,
        inserted: 2,
        updated: 5,
        unchanged: 20,
        errors: 1,
      },
      rco: {
        changes: {
          new: 2,
          unchanged: 20,
          baseline: 3,
          sessions_only: 1,
          content: 1,
        },
        missing: 1,
        structuresWritten: 4,
        ingestionRecordsCreated: 3,
        errors: [{ numeroAction: "B", error: "boom" }],
      },
    });
  });

  it("falls back to run counters when there is no checkpoint (DI)", () => {
    const summary = mapIngestionRunSummary({
      ...row,
      source: "di",
      status: "completed",
      options: {},
      checkpoint: null,
    });
    expect(summary.progress).toBeNull();
    expect(summary.rco).toBeNull();
    expect(summary.dryRun).toBe(false);
    expect(summary.counts.fetched).toBe(30);
  });

  it("ignores a malformed checkpoint instead of crashing the page", () => {
    const summary = mapIngestionRunSummary({
      ...row,
      checkpoint: { nextIndex: "x" },
    });
    expect(summary.progress).toBeNull();
    expect(summary.rco).toBeNull();
  });
});
