import type {
  ListWidgetConfigFields,
  WidgetConfig,
  WidgetConfigSummary,
} from "@playground/shared-types";
import { describe, expect, it } from "vitest";
import {
  buildDuplicate,
  countByView,
  filterByView,
  getDisplayedStatus,
  paginate,
  parseWidgetListParams,
  sortRows,
  toWidgetRow,
} from "./widget-list";

const now = new Date("2026-11-12T10:00:00Z");

const summary = (
  overrides: Partial<WidgetConfigSummary> = {},
): WidgetConfigSummary => ({
  _id: "1",
  publicId: "p1",
  internalTitle: "Widget",
  type: "list",
  status: "active",
  structureName: "Structure",
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
  statusUpdatedAt: "2026-10-01T00:00:00Z",
  ...overrides,
});

describe("getDisplayedStatus", () => {
  it("is disabled when the editor switched the widget off, whatever its traffic", () => {
    expect(
      getDisplayedStatus(
        { status: "inactive", lastTrafficAt: "2026-11-12T09:00:00Z" },
        now,
      ),
    ).toBe("disabled");
  });

  it("has no status until the first traffic", () => {
    expect(getDisplayedStatus({ status: "active" }, now)).toBe("none");
  });

  it("is active with a visit in the last 3 days, inactive after", () => {
    expect(
      getDisplayedStatus(
        { status: "active", lastTrafficAt: "2026-11-09T10:01:00Z" },
        now,
      ),
    ).toBe("active");
    expect(
      getDisplayedStatus(
        { status: "active", lastTrafficAt: "2026-11-09T10:00:00Z" },
        now,
      ),
    ).toBe("inactive");
  });
});

describe("toWidgetRow", () => {
  it("shows the date of the deactivation, or of the last traffic of an inactive widget", () => {
    expect(
      toWidgetRow(
        summary({
          status: "inactive",
          statusUpdatedAt: "2026-08-30T00:00:00Z",
        }),
        now,
      ).since,
    ).toBe("2026-08-30T00:00:00Z");
    expect(
      toWidgetRow(summary({ lastTrafficAt: "2026-10-26T00:00:00Z" }), now)
        .since,
    ).toBe("2026-10-26T00:00:00Z");
  });

  it("shows no date without traffic", () => {
    expect(toWidgetRow(summary(), now).since).toBeNull();
  });
});

describe("views", () => {
  const rows = [
    toWidgetRow(
      summary({ _id: "a", lastTrafficAt: "2026-11-12T00:00:00Z" }),
      now,
    ),
    toWidgetRow(
      summary({ _id: "b", lastTrafficAt: "2026-10-01T00:00:00Z" }),
      now,
    ),
    toWidgetRow(summary({ _id: "c", status: "inactive" }), now),
    toWidgetRow(summary({ _id: "d" }), now),
  ];

  it("counts the widgets of each view, the ones without status only being in the first", () => {
    expect(countByView(rows)).toEqual({
      all: 4,
      active: 1,
      inactive: 1,
      disabled: 1,
    });
  });

  it("filters on a view", () => {
    expect(filterByView(rows, "all")).toHaveLength(4);
    expect(filterByView(rows, "disabled").map((row) => row._id)).toEqual(["c"]);
  });
});

describe("sortRows", () => {
  it("sorts the titles in French order", () => {
    const rows = ["Été", "abri", "Zèbre"].map((internalTitle, index) =>
      toWidgetRow(summary({ _id: String(index), internalTitle }), now),
    );
    expect(
      sortRows(rows, "title", "asc").map((row) => row.internalTitle),
    ).toEqual(["abri", "Été", "Zèbre"]);
  });

  it("always puts the widgets without date last", () => {
    const rows = [
      toWidgetRow(summary({ _id: "none" }), now),
      toWidgetRow(
        summary({
          _id: "old",
          status: "inactive",
          statusUpdatedAt: "2026-01-01T00:00:00Z",
        }),
        now,
      ),
      toWidgetRow(
        summary({
          _id: "recent",
          status: "inactive",
          statusUpdatedAt: "2026-06-01T00:00:00Z",
        }),
        now,
      ),
    ];
    expect(sortRows(rows, "since", "asc").map((row) => row._id)).toEqual([
      "old",
      "recent",
      "none",
    ]);
    expect(sortRows(rows, "since", "desc").map((row) => row._id)).toEqual([
      "recent",
      "old",
      "none",
    ]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 5 }, (_, index) => index);

  it("returns the requested page", () => {
    expect(paginate(items, 2, 2)).toEqual({
      items: [2, 3],
      page: 2,
      totalPages: 3,
    });
  });

  it("clamps a page out of range", () => {
    expect(paginate(items, 9, 2).page).toBe(3);
    expect(paginate(items, 0, 2).page).toBe(1);
    expect(paginate([], 1, 2)).toEqual({ items: [], page: 1, totalPages: 1 });
  });
});

describe("buildDuplicate", () => {
  const list: WidgetConfig = {
    _id: "1",
    publicId: "p1",
    statusUpdatedAt: "2026-10-01T00:00:00Z",
    lastTrafficAt: "2026-11-01T00:00:00Z",
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-02T00:00:00Z",
    type: "list",
    internalTitle: "Widget",
    structureName: "Structure",
    authorizedDomains: ["exemple.org"],
    externalTitle: "Titre",
    status: "inactive",
    displayDescription: false,
    filters: {
      departments: ["Gironde"],
      _id: "x",
    } as ListWidgetConfigFields["filters"],
    selectedDispositifIds: ["d1"],
    excludedDispositifIds: [],
    pageSize: 8,
    sortBy: "date",
    displayShareModule: true,
    displayFilterBar: false,
    filterBarOptions: [],
  };

  it("copies the content and suffixes the title, without what the API manages", () => {
    const duplicate = buildDuplicate(list);

    expect(duplicate).toMatchObject({
      type: "list",
      internalTitle: "Widget (1)",
      structureName: "Structure",
      authorizedDomains: ["exemple.org"],
      selectedDispositifIds: ["d1"],
      pageSize: 8,
    });
    expect(Object.keys(duplicate)).not.toContain("_id");
    expect(Object.keys(duplicate)).not.toContain("publicId");
    expect(Object.keys(duplicate)).not.toContain("lastTrafficAt");
    expect(Object.keys(duplicate)).not.toContain("description");
  });

  it("enables the copy, even of a disabled widget, so that it starts without status", () => {
    expect(buildDuplicate(list).status).toBe("active");
  });

  it("only keeps the known filters", () => {
    expect((buildDuplicate(list) as ListWidgetConfigFields).filters).toEqual({
      departments: ["Gironde"],
    });
  });

  it("keeps the title within the limit of the API", () => {
    const { internalTitle } = buildDuplicate({
      ...list,
      internalTitle: "a".repeat(150),
    });
    expect(internalTitle).toHaveLength(150);
    expect(internalTitle.endsWith(" (1)")).toBe(true);
  });

  it("copies a thumbnail with its content", () => {
    const thumbnail: WidgetConfig = {
      _id: "2",
      publicId: "p2",
      statusUpdatedAt: list.statusUpdatedAt,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      type: "thumbnail",
      internalTitle: "Vignette",
      structureName: "Structure",
      authorizedDomains: [],
      externalTitle: "Titre",
      status: "active",
      dispositifId: "d9",
    };
    expect(buildDuplicate(thumbnail)).toEqual({
      type: "thumbnail",
      internalTitle: "Vignette (1)",
      structureName: "Structure",
      authorizedDomains: [],
      externalTitle: "Titre",
      status: "active",
      dispositifId: "d9",
    });
  });
});

describe("parseWidgetListParams", () => {
  it("reads the query of the page", () => {
    expect(
      parseWidgetListParams({
        view: "disabled",
        sortBy: "title",
        sortOrder: "asc",
        page: "3",
      }),
    ).toEqual({ view: "disabled", sortBy: "title", sortOrder: "asc", page: 3 });
  });

  it("falls back to the defaults on a missing or invalid value", () => {
    const defaults = {
      view: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    };
    expect(parseWidgetListParams({})).toEqual(defaults);
    expect(
      parseWidgetListParams({
        view: "nope",
        sortBy: "nope",
        sortOrder: "sideways",
        page: "abc",
      }),
    ).toEqual(defaults);
  });

  it("keeps the first value of a repeated key", () => {
    expect(parseWidgetListParams({ view: ["active", "inactive"] }).view).toBe(
      "active",
    );
  });
});
