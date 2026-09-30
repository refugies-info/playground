import type { Tables } from "@playground/supabase";
import { z } from "zod";

export type IngestionRunRow = Pick<
  Tables<"ingestion_runs">,
  | "id"
  | "source"
  | "status"
  | "created_at"
  | "completed_at"
  | "options"
  | "total_fetched"
  | "total_inserted"
  | "total_updated"
  | "total_unchanged"
  | "total_errors"
  | "checkpoint"
>;

// Written by the RCO workflow after each batch (see RcoCheckpoint).
const RcoCheckpointSchema = z.object({
  numeroActions: z.array(z.string()),
  nextIndex: z.number(),
  totals: z.object({
    missing: z.number(),
    changes: z.object({
      new: z.number(),
      unchanged: z.number(),
      baseline: z.number(),
      sessions_only: z.number(),
      content: z.number(),
    }),
    structuresWritten: z.number(),
    ingestionRecordsCreated: z.number(),
    errors: z.array(z.object({ numeroAction: z.string(), error: z.string() })),
    // Absent from checkpoints written before per-action outcomes existed.
    outcomes: z
      .array(
        z.object({
          numeroAction: z.string(),
          change: z.string(),
          changedFields: z.array(z.string()).default([]),
          diComparison: z
            .array(
              z.object({
                field: z.string(),
                di: z.string().nullable(),
                rco: z.string().nullable(),
                same: z.boolean(),
              }),
            )
            .default([]),
        }),
      )
      .default([]),
  }),
});

const withoutOutcomes = ({ outcomes: _, ...totals }: RcoTotals) => totals;

const DryRunOptionSchema = z.object({ dryRun: z.boolean() });

export type IngestionRunSummary = {
  id: string;
  source: string;
  status: string;
  dryRun: boolean;
  createdAt: string;
  completedAt: string | null;
  progress: { processed: number; total: number } | null;
  counts: {
    fetched: number;
    inserted: number;
    updated: number;
    unchanged: number;
    errors: number;
  };
  rco: Omit<RcoTotals, "outcomes"> | null;
  actions: IngestionRunAction[];
};

type RcoTotals = z.infer<typeof RcoCheckpointSchema>["totals"];

export type IngestionRunDocument = { id: string; title: string | null };

export type IngestionRunAction = {
  numeroAction: string;
  change: string;
  document: IngestionRunDocument | null;
  changedFields: string[];
  diComparison: DiComparisonRow[];
};

export type DiComparisonRow =
  RcoTotals["outcomes"][number]["diComparison"][number];

export function rcoOutcomeActionNumbers(checkpoint: unknown): string[] {
  const parsed = RcoCheckpointSchema.safeParse(checkpoint);
  return parsed.success
    ? parsed.data.totals.outcomes.map(({ numeroAction }) => numeroAction)
    : [];
}

export function mapIngestionRunSummary(
  row: IngestionRunRow,
  documentsByActionNumber: Map<string, IngestionRunDocument> = new Map(),
): IngestionRunSummary {
  const checkpoint = RcoCheckpointSchema.safeParse(row.checkpoint);
  const options = DryRunOptionSchema.safeParse(row.options);
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    dryRun: options.success && options.data.dryRun,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    progress: checkpoint.success
      ? {
          processed: checkpoint.data.nextIndex,
          total: checkpoint.data.numeroActions.length,
        }
      : null,
    counts: {
      fetched: row.total_fetched,
      inserted: row.total_inserted,
      updated: row.total_updated,
      unchanged: row.total_unchanged,
      errors: row.total_errors,
    },
    rco: checkpoint.success ? withoutOutcomes(checkpoint.data.totals) : null,
    actions: checkpoint.success
      ? checkpoint.data.totals.outcomes.map(
          ({ numeroAction, change, changedFields, diComparison }) => ({
            numeroAction,
            change,
            document: documentsByActionNumber.get(numeroAction) ?? null,
            changedFields,
            diComparison,
          }),
        )
      : [],
  };
}
