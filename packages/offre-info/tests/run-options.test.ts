import { describe, expect, it } from "vitest";
import { RCO_RUN_OPTIONS, RcoRunOptionsSchema } from "../src/run-options";

describe("RcoRunOptionsSchema", () => {
  it("defaults to a small dry run", () => {
    expect(RcoRunOptionsSchema.parse({})).toEqual({
      dryRun: true,
      maxActions: 20,
      pageSize: 100,
    });
  });

  it("button options stay valid", () => {
    expect(() => RcoRunOptionsSchema.parse(RCO_RUN_OPTIONS)).not.toThrow();
  });

  it("rejects a page size above the API maximum", () => {
    expect(() => RcoRunOptionsSchema.parse({ pageSize: 5000 })).toThrow();
  });
});
