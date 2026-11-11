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

// Written by the RCO workflow at the end of the run (see ingestRcoStep).
const RcoCheckpointSchema = z.object({
  totals: z.object({
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
  }),
});

export type IngestionRunSummary = {
  id: string;
  source: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  counts: {
    fetched: number;
    inserted: number;
    updated: number;
    unchanged: number;
    errors: number;
  };
  rco: RcoTotals | null;
};

type RcoTotals = z.infer<typeof RcoCheckpointSchema>["totals"];

export function mapIngestionRunSummary(
  row: IngestionRunRow,
): IngestionRunSummary {
  const checkpoint = RcoCheckpointSchema.safeParse(row.checkpoint);
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    counts: {
      fetched: row.total_fetched,
      inserted: row.total_inserted,
      updated: row.total_updated,
      unchanged: row.total_unchanged,
      errors: row.total_errors,
    },
    rco: checkpoint.success ? checkpoint.data.totals : null,
  };
}
