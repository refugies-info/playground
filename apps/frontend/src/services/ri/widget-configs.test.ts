import type { WidgetConfigFields } from "@playground/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { riWebhookRequest } from "./webhook-client";
import {
  countRiFilterMatches,
  createRiWidgetConfig,
  getRiDispositifsByIds,
  listRiWidgetConfigs,
  updateRiWidgetConfig,
} from "./widget-configs";

vi.mock("./webhook-client");

describe("ri/widget-configs", () => {
  const request = vi.mocked(riWebhookRequest);

  beforeEach(() => {
    request.mockReset();
  });

  it("creates a widget config on behalf of the editor", async () => {
    request.mockResolvedValue({ id: "w1", publicId: "p1" });
    const widgetConfig: WidgetConfigFields = {
      internalTitle: "Widget",
      type: "list",
      structureName: "Association Exemple",
      authorizedDomains: [],
      externalTitle: "Title",
      displayDescription: true,
      filters: {},
      selectedDispositifIds: [],
      excludedDispositifIds: [],
      pageSize: 8,
      sortBy: "date",
      displayShareModule: true,
      displayFilterBar: true,
      filterBarOptions: ["keyword"],
      status: "inactive",
    };

    await expect(createRiWidgetConfig("a@b.fr", widgetConfig)).resolves.toEqual(
      {
        id: "w1",
        publicId: "p1",
      },
    );
    expect(request).toHaveBeenCalledWith("/api/webhook/widget-config/create", {
      method: "POST",
      body: { email: "a@b.fr", widgetConfig },
    });
  });

  it("sends the id and only the changed fields on update", async () => {
    request.mockResolvedValue({ id: "w1" });

    await updateRiWidgetConfig("a@b.fr", "w1", { status: "active" });

    expect(request).toHaveBeenCalledWith("/api/webhook/widget-config/update", {
      method: "PATCH",
      body: { email: "a@b.fr", widgetConfig: { _id: "w1", status: "active" } },
    });
  });

  it("returns the count of the preview", async () => {
    request.mockResolvedValue({ count: 5 });

    await expect(
      countRiFilterMatches({ departments: ["Gironde"] }),
    ).resolves.toBe(5);
    expect(request).toHaveBeenCalledWith(
      "/api/webhook/widget-config/preview-count",
      { method: "POST", body: { filters: { departments: ["Gironde"] } } },
    );
  });

  it("lists the widget configs", async () => {
    request.mockResolvedValue([]);

    await listRiWidgetConfigs();

    expect(request).toHaveBeenCalledWith("/api/webhook/widget-config");
  });

  it("does not call Refugies.info to resolve an empty list of ids", async () => {
    await expect(getRiDispositifsByIds([])).resolves.toEqual([]);
    expect(request).not.toHaveBeenCalled();
  });

  it("resolves ids in one call", async () => {
    request.mockResolvedValue([]);

    await getRiDispositifsByIds(["a", "b"]);

    expect(request).toHaveBeenCalledWith("/api/webhook/dispositif/search", {
      query: { ids: "a,b" },
    });
  });
});
