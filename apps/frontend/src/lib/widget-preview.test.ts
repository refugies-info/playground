import { describe, expect, it } from "vitest";
import { buildPreviewUrl } from "./widget-preview";

describe("buildPreviewUrl", () => {
  it("points to the iframe page of the widget, flagged as a preview", () => {
    expect(buildPreviewUrl("https://widget.refugies.info", "abc", 0)).toBe(
      "https://widget.refugies.info/w/abc?preview=1&v=0",
    );
  });

  it("ignores a trailing slash and changes with the version", () => {
    expect(buildPreviewUrl("http://localhost:3002/", "abc", 3)).toBe(
      "http://localhost:3002/w/abc?preview=1&v=3",
    );
  });
});
