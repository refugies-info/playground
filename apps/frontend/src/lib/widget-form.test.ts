import type { RiDispositifSummary } from "@playground/shared-types";
import { describe, expect, it } from "vitest";
import {
  buildListUpdate,
  buildThumbnailUpdate,
  buildWidgetDraft,
  getActiveFilterBarOptions,
  getDispositifTitle,
  hasListChanges,
  hasThumbnailChanges,
  isDispositifId,
  type ListFormValues,
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
      pageSize: 12,
      sortBy: "date",
      displayFilterBar: false,
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

const listValues: ListFormValues = {
  internalTitle: " Widget cours ",
  structureName: " Partenaire ",
  authorizedDomains: ["exemple.org"],
  externalTitle: " Apprendre le français ",
  displayDescription: true,
  description: " Trouvez un cours ",
  filters: {},
  pageSize: 12,
  displayShareModule: true,
  displayFilterBar: true,
  filterBarOptions: ["keyword", "location", "theme"],
  sortBy: "date",
};

describe("buildListUpdate", () => {
  it("trims the texts and never sends the type nor the status", () => {
    const update = buildListUpdate(listValues);
    expect(update).toMatchObject({
      internalTitle: "Widget cours",
      structureName: "Partenaire",
      externalTitle: "Apprendre le français",
      description: "Trouvez un cours",
    });
    expect(update).not.toHaveProperty("type");
    expect(update).not.toHaveProperty("status");
  });

  it("leaves the description untouched when it is not displayed", () => {
    const update = buildListUpdate({
      ...listValues,
      displayDescription: false,
    });
    expect(update).toMatchObject({ displayDescription: false });
    expect(update).not.toHaveProperty("description");
  });

  it("drops the filter bar criteria already fixed by the widget content", () => {
    const update = buildListUpdate({
      ...listValues,
      filters: { departments: ["75 - Paris"] },
    });
    expect(update).toMatchObject({ filterBarOptions: ["keyword", "theme"] });
  });
});

describe("getActiveFilterBarOptions", () => {
  it("ignores empty filters", () => {
    expect(
      getActiveFilterBarOptions(["location", "age"], { departments: [] }),
    ).toEqual(["location", "age"]);
  });
});

describe("hasListChanges", () => {
  it("detects an edited value", () => {
    expect(hasListChanges(listValues, { ...listValues })).toBe(false);
    expect(hasListChanges(listValues, { ...listValues, pageSize: 8 })).toBe(
      true,
    );
  });
});
