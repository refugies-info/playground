import { describe, expect, it } from "vitest";
import { buildEmbedCode, buildEmbedUrl } from "./widget-embed";

describe("buildEmbedUrl", () => {
  it("points to the page of the widget, without the preview flag", () => {
    expect(buildEmbedUrl("https://widget.example.org/", "abc")).toBe(
      "https://widget.example.org/w/abc",
    );
  });
});

describe("buildEmbedCode", () => {
  it("is an iframe on the url, allowed to geolocate", () => {
    const code = buildEmbedCode("https://widget.example.org/w/abc");
    expect(code).toMatch(
      /^<iframe src="https:\/\/widget\.example\.org\/w\/abc"/,
    );
    expect(code).toContain('allow="geolocation"');
    expect(code).toMatch(/<\/iframe>$/);
  });
});
