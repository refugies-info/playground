import { describe, expect, it } from "vitest";
import {
  mapIngestionRunSummary,
  rcoOutcomeActionNumbers,
} from "./ingestion-run";

const row = {
  id: "run-1",
  source: "rco",
  status: "completed",
  created_at: "2026-09-28T08:00:00Z",
  completed_at: "2026-09-28T08:05:00Z",
  options: {},
  total_fetched: 30,
  total_inserted: 2,
  total_updated: 5,
  total_unchanged: 20,
  total_errors: 1,
  checkpoint: {
    totals: {
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
      outcomes: [
        {
          numeroAction: "A",
          change: "baseline",
          diComparison: [
            { field: "Titre", di: "Ancien", rco: "Nouveau", same: false },
          ],
        },
        { numeroAction: "B", change: "error" },
        {
          numeroAction: "C",
          change: "content",
          changedFields: ["nombre_heures_total", "sessions"],
        },
      ],
    },
  },
};

describe("mapIngestionRunSummary", () => {
  it("exposes the RCO change breakdown from the checkpoint", () => {
    const documents = new Map([["A", { id: "wf-a", title: "Fiche A" }]]);
    expect(mapIngestionRunSummary(row, documents)).toEqual({
      id: "run-1",
      source: "rco",
      status: "completed",
      createdAt: "2026-09-28T08:00:00Z",
      completedAt: "2026-09-28T08:05:00Z",
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
        structuresWritten: 4,
        ingestionRecordsCreated: 3,
        errors: [{ numeroAction: "B", error: "boom" }],
      },
      actions: [
        {
          numeroAction: "A",
          change: "baseline",
          document: { id: "wf-a", title: "Fiche A" },
          changedFields: [],
          diComparison: [
            { field: "Titre", di: "Ancien", rco: "Nouveau", same: false },
          ],
        },
        {
          numeroAction: "B",
          change: "error",
          document: null,
          changedFields: [],
          diComparison: [],
        },
        {
          numeroAction: "C",
          change: "content",
          document: null,
          changedFields: ["nombre_heures_total", "sessions"],
          diComparison: [],
        },
      ],
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
    expect(summary.rco).toBeNull();
    expect(summary.actions).toEqual([]);
    expect(summary.counts.fetched).toBe(30);
  });

  it("ignores a malformed checkpoint instead of crashing the page", () => {
    const summary = mapIngestionRunSummary({
      ...row,
      checkpoint: { totals: "x" },
    });
    expect(summary.rco).toBeNull();
  });
});

describe("rcoOutcomeActionNumbers", () => {
  it("lists action numbers of a checkpoint written before outcomes existed", () => {
    const { outcomes: _, ...totals } = row.checkpoint.totals;
    expect(rcoOutcomeActionNumbers({ ...row.checkpoint, totals })).toEqual([]);
  });

  it("lists action numbers from outcomes", () => {
    expect(rcoOutcomeActionNumbers(row.checkpoint)).toEqual(["A", "B", "C"]);
  });
});
