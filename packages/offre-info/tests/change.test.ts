import { computeContentHash } from "@playground/supabase/ingestion-runs";
import { describe, expect, it } from "vitest";
import { changedTopLevelFields, classifyChange } from "../src/change";
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
