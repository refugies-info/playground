import { computeContentHash } from "@playground/supabase/ingestion-runs";
import type { RcoActionDocument } from "./document";

export type RcoChange =
  | "new"
  | "unchanged"
  | "baseline"
  | "sessions_only"
  | "content";

export type PreviousService = {
  origin: "DI" | "RCO";
  content_hash: string | null;
  data: unknown;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};

const withoutSessions = (document: unknown) =>
  Object.fromEntries(
    Object.entries(asRecord(document)).filter(
      ([field]) => field !== "sessions",
    ),
  );

export function classifyChange(
  previous: PreviousService | undefined,
  next: RcoActionDocument,
): RcoChange {
  if (!previous) return "new";
  if (previous.content_hash === computeContentHash(next)) return "unchanged";
  // DI and RCO shapes differ: the first RCO version becomes the new reference.
  if (previous.origin === "DI") return "baseline";
  return computeContentHash(withoutSessions(previous.data)) ===
    computeContentHash(withoutSessions(next))
    ? "sessions_only"
    : "content";
}

export const createsIngestionRecord = (change: RcoChange): boolean =>
  change === "new" || change === "content";

export function changedTopLevelFields(
  previous: unknown,
  next: RcoActionDocument,
): string[] {
  const before = asRecord(previous);
  const after = asRecord(next);
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(
      (field) =>
        computeContentHash(before[field] ?? null) !==
        computeContentHash(after[field] ?? null),
    )
    .sort();
}
