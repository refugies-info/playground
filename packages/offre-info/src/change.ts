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
  next: unknown,
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

const sessionsById = (document: unknown) =>
  new Map(
    (Array.isArray(asRecord(document).sessions)
      ? (asRecord(document).sessions as unknown[])
      : []
    ).map((session) => [String(asRecord(session).id), session]),
  );

function changedSessionPaths(previous: unknown, next: unknown): string[] {
  const before = sessionsById(previous);
  const after = sessionsById(next);
  const paths = new Set<string>();
  for (const [id, session] of after) {
    if (!before.has(id)) paths.add("sessions.added");
    else {
      for (const field of changedTopLevelFields(before.get(id), session)) {
        paths.add(`sessions.${field}`);
      }
    }
  }
  for (const id of before.keys()) {
    if (!after.has(id)) paths.add("sessions.removed");
  }
  return [...paths].sort();
}

// Readable diff: action fields, plus per-session detail instead of "sessions".
export function changedFieldPaths(
  previous: unknown,
  next: RcoActionDocument,
): string[] {
  return changedTopLevelFields(previous, next).flatMap((field) =>
    field === "sessions" ? changedSessionPaths(previous, next) : [field],
  );
}
