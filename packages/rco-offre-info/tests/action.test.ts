import { describe, expect, it } from "vitest";
import { fetchActionDetail } from "../src/api/action";
import type { RcoClient } from "../src/api/client";
import { normalizeSession } from "../src/api/normalize";
import { buildActionDocument } from "../src/lheo/document";
import { rawSession } from "./fixtures";

const stored = buildActionDocument(
  [normalizeSession(rawSession({ objectif_formation: undefined }))],
  "carif-oref--01_999",
);
const clientReturning = (body: unknown): RcoClient => ({
  get: async () => body,
});

describe("fetchActionDetail", () => {
  it("rebuilds the document from /offre", async () => {
    const detail = await fetchActionDetail(
      clientReturning([rawSession()]),
      stored,
    );
    expect(detail.objectif_formation).toBe("<p>Améliorer le français</p>");
    expect(detail.structure_id).toBe("carif-oref--01_999");
  });

  it("keeps the stored document when /offre has nothing", async () => {
    expect(await fetchActionDetail(clientReturning(null), stored)).toBe(stored);
  });
});
