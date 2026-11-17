import type { RiDispositifSummary } from "@playground/shared-types";
import { describe, expect, it } from "vitest";
import {
  buildThumbnailUpdate,
  buildWidgetDraft,
  getDispositifTitle,
  hasThumbnailChanges,
  isDispositifId,
  normalizeDomain,
} from "./widget-form";

const dispositif: RiDispositifSummary = {
  id: "6a8aa3791f5d9938b6b54ac3",
  type: "dispositif",
  status: "Actif",
  titreInformatif: "Demander un titre de voyage",
  titreMarque: "Titre de voyage",
};

const values = {
  internalTitle: "  Widget titre de voyage ",
  structureName: " Service-Public.fr ",
  authorizedDomains: ["service-public.fr"],
};

describe("normalizeDomain", () => {
  it.each([
    ["service-public.fr", "service-public.fr"],
    ["  Service-Public.FR ", "service-public.fr"],
    ["https://www.exemple.org/une/page?x=1#top", "www.exemple.org"],
    ["staging.sp-local.fr:3000", "staging.sp-local.fr"],
    ["exemple.org.", "exemple.org"],
  ])("keeps the host of %s", (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "localhost",
    "exemple",
    "exemple..org",
    "-exemple.org",
    "exem ple.org",
    "https://",
    "exemple.o",
  ])("rejects %j", (input) => {
    expect(normalizeDomain(input)).toBeNull();
  });
});

describe("isDispositifId", () => {
  it("recognizes a Mongo object id", () => {
    expect(isDispositifId("6a8aa3791f5d9938b6b54ac3")).toBe(true);
    expect(isDispositifId(" 6A8AA3791F5D9938B6B54AC3 ")).toBe(true);
  });

  it("treats anything else as a keyword", () => {
    expect(isDispositifId("titre de voyage")).toBe(false);
    expect(isDispositifId("6a8aa3791f5d9938b6b54ac")).toBe(false);
  });
});

describe("getDispositifTitle", () => {
  it("prefers the informative title, then the brand title", () => {
    expect(getDispositifTitle(dispositif)).toBe("Demander un titre de voyage");
    expect(
      getDispositifTitle({ ...dispositif, titreInformatif: undefined }),
    ).toBe("Titre de voyage");
    expect(
      getDispositifTitle({
        ...dispositif,
        titreInformatif: undefined,
        titreMarque: undefined,
      }),
    ).toBe("Sans titre");
  });
});

describe("buildWidgetDraft", () => {
  const popoverValues = { title: " Titre de voyage ", structureName: " SP " };

  it("builds an active thumbnail without content", () => {
    expect(buildWidgetDraft("thumbnail", popoverValues)).toEqual({
      type: "thumbnail",
      status: "active",
      internalTitle: "Titre de voyage",
      structureName: "SP",
      authorizedDomains: [],
      externalTitle: "Titre de voyage",
    });
  });

  it("builds an active list with every required field", () => {
    expect(buildWidgetDraft("list", popoverValues)).toMatchObject({
      type: "list",
      status: "active",
      internalTitle: "Titre de voyage",
      externalTitle: "Titre de voyage",
      filters: {},
      selectedDispositifIds: [],
      excludedDispositifIds: [],
      pageSize: 8,
      sortBy: "date",
    });
  });
});

describe("buildThumbnailUpdate", () => {
  it("keeps the draft titles while no fiche is chosen", () => {
    const update = buildThumbnailUpdate(values, null);
    expect(update).not.toHaveProperty("dispositifId");
    expect(update).not.toHaveProperty("externalTitle");
  });

  it("never sends the type nor the status", () => {
    const update = buildThumbnailUpdate(values, dispositif);
    expect(update).not.toHaveProperty("type");
    expect(update).not.toHaveProperty("status");
    expect(update).toMatchObject({
      dispositifId: "6a8aa3791f5d9938b6b54ac3",
      externalTitle: "Demander un titre de voyage",
    });
  });
});

describe("hasThumbnailChanges", () => {
  const initial = { values, dispositifId: dispositif.id };

  it("is false for the same content", () => {
    expect(
      hasThumbnailChanges(initial, {
        values: { ...values, authorizedDomains: [...values.authorizedDomains] },
        dispositifId: dispositif.id,
      }),
    ).toBe(false);
  });

  it.each([
    ["title", { ...values, internalTitle: "Autre" }, dispositif.id],
    ["partner", { ...values, structureName: "Autre" }, dispositif.id],
    ["domains", { ...values, authorizedDomains: [] }, dispositif.id],
    ["fiche", values, "autre"],
  ])("is true when the %s changes", (_, nextValues, dispositifId) => {
    expect(
      hasThumbnailChanges(initial, { values: nextValues, dispositifId }),
    ).toBe(true);
  });
});
