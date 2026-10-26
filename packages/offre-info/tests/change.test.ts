import { computeContentHash } from "@playground/supabase/ingestion-runs";
import { describe, expect, it } from "vitest";
import {
  changedFieldPaths,
  changedTopLevelFields,
  classifyChange,
  createsIngestionRecord,
} from "../src/change";
import { buildActionDocument } from "../src/document";
import { normalizeSession } from "../src/normalize";
import { rawSession } from "./fixtures";

const build = (overrides: Record<string, unknown> = {}) =>
  buildActionDocument([normalizeSession(rawSession(overrides))], "s");

const asPrevious = (data: unknown, origin: "DI" | "RCO" = "RCO") => ({
  origin,
  data,
  content_hash: computeContentHash(data),
});

describe("classifyChange", () => {
  it("new when no previous service", () => {
    expect(classifyChange(undefined, build())).toBe("new");
  });

  it("unchanged when hash is identical", () => {
    expect(classifyChange(asPrevious(build()), build())).toBe("unchanged");
  });

  it("baseline when previous version comes from DI", () => {
    expect(classifyChange(asPrevious({ id: "x" }, "DI"), build())).toBe(
      "baseline",
    );
  });

  it("sessions_only when only session fields differ", () => {
    expect(
      classifyChange(asPrevious(build()), build({ date_fin: "2028-01-01" })),
    ).toBe("sessions_only");
  });

  it("content when an action field differs", () => {
    expect(
      classifyChange(asPrevious(build()), build({ nombre_heures_total: 200 })),
    ).toBe("content");
  });
});

describe("changedTopLevelFields", () => {
  it("lists differing keys", () => {
    expect(
      changedTopLevelFields(build(), build({ nombre_heures_total: 200 })),
    ).toEqual(["nombre_heures_total"]);
  });
});

describe("changedFieldPaths", () => {
  const withSessions = (sessions: Array<Record<string, unknown>>) => ({
    ...build(),
    sessions: sessions as never,
  });

  it("details session fields instead of a bare 'sessions'", () => {
    expect(
      changedFieldPaths(
        withSessions([{ id: "s1", date_fin: "2027-01-31" }]),
        withSessions([{ id: "s1", date_fin: "2028-01-01" }]),
      ),
    ).toEqual(["sessions.date_fin"]);
  });

  it("reports added and removed sessions", () => {
    expect(
      changedFieldPaths(
        withSessions([{ id: "s1" }, { id: "s2" }]),
        withSessions([{ id: "s1" }, { id: "s3" }]),
      ),
    ).toEqual(["sessions.added", "sessions.removed"]);
  });

  it("keeps action-level fields as they are", () => {
    expect(
      changedFieldPaths(build(), build({ nombre_heures_total: 200 })),
    ).toEqual(["nombre_heures_total"]);
  });
});

describe("createsIngestionRecord", () => {
  const conventionnee = { conventionnement: true };

  it("creates a record for new, baseline and content changes only", () => {
    expect(createsIngestionRecord("new", conventionnee)).toBe(true);
    expect(createsIngestionRecord("baseline", conventionnee)).toBe(true);
    expect(createsIngestionRecord("content", conventionnee)).toBe(true);
    expect(createsIngestionRecord("sessions_only", conventionnee)).toBe(false);
    expect(createsIngestionRecord("unchanged", conventionnee)).toBe(false);
  });

  it("never creates a record for a non conventionnée action", () => {
    expect(createsIngestionRecord("new", { conventionnement: false })).toBe(
      false,
    );
  });
});
