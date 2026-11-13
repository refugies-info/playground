import type { RcoBatchResult } from "@playground/rco-offre-info";
import { FatalError } from "@workflow/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeSourceRunStep,
  createSourceRunStep,
  ingestSourceStep,
} from "../src/steps/ingestion/ingest-source";

type Totals = RcoBatchResult;

const mocks = vi.hoisted(() => ({
  supabase: { fake: "supabase" },
  fetchAll: vi.fn(),
  ingestBatch: vi.fn(),
  createIngestionRun: vi.fn(),
  completeIngestionRun: vi.fn(),
  saveIngestionCheckpoint: vi.fn(),
}));

vi.mock("../src/steps/ingestion/utils", () => ({
  getSupabaseClient: () => mocks.supabase,
}));
vi.mock("@playground/supabase/ingestion-runs", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createIngestionRun: mocks.createIngestionRun,
  completeIngestionRun: mocks.completeIngestionRun,
  saveIngestionCheckpoint: mocks.saveIngestionCheckpoint,
}));

// --- Source under test: the only block that changes when the code moves ---
vi.mock("@playground/rco-offre-info", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@playground/rco-offre-info")>();
  return {
    ...actual,
    rcoProvider: {
      ...actual.rcoProvider,
      fetchAll: mocks.fetchAll,
      ingestBatch: mocks.ingestBatch,
    },
  };
});
const steps = {
  create: () => createSourceRunStep("rco"),
  ingest: (runId: string) => ingestSourceStep("rco", runId),
  complete: (
    runId: string,
    status: "completed" | "failed",
    totals?: Totals,
    failure?: string,
  ) => completeSourceRunStep("rco", runId, status, totals, failure),
};
// ---

const batch = (overrides: Partial<Totals> = {}): Totals => ({
  processed: 0,
  changes: { new: 0, unchanged: 0, baseline: 0, sessions_only: 0, content: 0 },
  structuresWritten: 0,
  ingestionRecordsCreated: 0,
  errors: [],
  ...overrides,
});

const action = (numeroAction: string) => ({ numeroAction });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createIngestionRun.mockResolvedValue("run-1");
});

describe("RCO ingestion steps", () => {
  it("creates a run", async () => {
    expect(await steps.create()).toBe("run-1");
    expect(mocks.createIngestionRun).toHaveBeenCalledWith(mocks.supabase, {
      source: "rco",
      type: "services",
      options: {},
    });
  });

  it("chunks by 200, sums totals and saves the checkpoint", async () => {
    mocks.fetchAll.mockResolvedValue(
      Array.from({ length: 450 }, (_, i) => action(String(i))),
    );
    const error = { numeroAction: "7", error: "x" };
    const b1 = batch({
      processed: 200,
      changes: {
        new: 1,
        unchanged: 2,
        baseline: 3,
        sessions_only: 4,
        content: 5,
      },
      structuresWritten: 6,
      ingestionRecordsCreated: 7,
      errors: [error],
    });
    const b2 = batch({
      processed: 200,
      changes: {
        new: 10,
        unchanged: 20,
        baseline: 30,
        sessions_only: 40,
        content: 50,
      },
      structuresWritten: 60,
      ingestionRecordsCreated: 70,
    });
    const b3 = batch({
      processed: 50,
      changes: {
        new: 100,
        unchanged: 200,
        baseline: 300,
        sessions_only: 400,
        content: 500,
      },
      structuresWritten: 600,
      ingestionRecordsCreated: 700,
    });
    mocks.ingestBatch
      .mockResolvedValueOnce(b1)
      .mockResolvedValueOnce(b2)
      .mockResolvedValueOnce(b3);

    const totals = await steps.ingest("run-1");

    const calls = mocks.ingestBatch.mock.calls.map(([c, a, id]) => [
      c,
      a.length,
      a[0].numeroAction,
      id,
    ]);
    expect(calls).toEqual([
      [mocks.supabase, 200, "0", "run-1"],
      [mocks.supabase, 200, "200", "run-1"],
      [mocks.supabase, 50, "400", "run-1"],
    ]);
    const expected = {
      processed: 450,
      changes: {
        new: 111,
        unchanged: 222,
        baseline: 333,
        sessions_only: 444,
        content: 555,
      },
      structuresWritten: 666,
      ingestionRecordsCreated: 777,
      errors: [error],
    };
    expect(totals).toEqual(expected);
    expect(mocks.saveIngestionCheckpoint).toHaveBeenCalledWith(
      mocks.supabase,
      "run-1",
      { totals: expected },
    );
  });

  it("handles zero actions", async () => {
    mocks.fetchAll.mockResolvedValue([]);
    const totals = await steps.ingest("run-1");
    expect(mocks.ingestBatch).not.toHaveBeenCalled();
    expect(totals).toEqual(batch());
    expect(mocks.saveIngestionCheckpoint).toHaveBeenCalledWith(
      mocks.supabase,
      "run-1",
      { totals: batch() },
    );
  });

  it("maps an RcoAuthError to FatalError", async () => {
    mocks.fetchAll.mockRejectedValue(
      Object.assign(new Error("401 bad key"), { name: "RcoAuthError" }),
    );
    const rejection = await steps.ingest("run-1").catch((e) => e);
    expect(rejection).toBeInstanceOf(FatalError);
    expect(rejection.message).toBe("401 bad key");
  });

  it("rethrows other errors untouched", async () => {
    mocks.fetchAll.mockRejectedValue(new Error("timeout"));
    const rejection = await steps.ingest("run-1").catch((e) => e);
    expect(rejection).not.toBeInstanceOf(FatalError);
    expect(rejection.message).toBe("timeout");
  });

  const totals = batch({
    processed: 15,
    changes: {
      new: 2,
      unchanged: 3,
      baseline: 1,
      sessions_only: 4,
      content: 5,
    },
  });
  const stats = {
    totalFetched: 15,
    totalInserted: 2,
    totalUpdated: 10,
    totalUnchanged: 3,
    totalErrors: 0,
  };

  it("completes with stats and error details", async () => {
    const error = { numeroAction: "7", error: "x" };
    await steps.complete("run-1", "completed", { ...totals, errors: [error] });
    expect(mocks.completeIngestionRun).toHaveBeenCalledWith(
      mocks.supabase,
      "run-1",
      { ...stats, totalErrors: 1 },
      "completed",
      [error],
    );
  });

  it("completes without error details when there are no errors", async () => {
    await steps.complete("run-1", "completed", totals);
    expect(mocks.completeIngestionRun).toHaveBeenCalledWith(
      mocks.supabase,
      "run-1",
      stats,
      "completed",
      undefined,
    );
  });

  it("records a failure with zero stats", async () => {
    await steps.complete("run-1", "failed", undefined, "Error: boom");
    expect(mocks.completeIngestionRun).toHaveBeenCalledWith(
      mocks.supabase,
      "run-1",
      {
        totalFetched: 0,
        totalInserted: 0,
        totalUpdated: 0,
        totalUnchanged: 0,
        totalErrors: 0,
      },
      "failed",
      { failure: "Error: boom", errors: [] },
    );
  });
});
