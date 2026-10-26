import type {
  CreatedWidgetConfigResponse,
  RiDispositifSummary,
  WidgetConfig,
  WidgetConfigFields,
  WidgetConfigFilters,
  WidgetConfigSummary,
  WidgetConfigUpdateInput,
} from "@playground/shared-types";
import { riWebhookRequest } from "./webhook-client";

const WIDGET_CONFIG_PATH = "/api/webhook/widget-config";
const DISPOSITIF_SEARCH_PATH = "/api/webhook/dispositif/search";

export const searchRiDispositifs = (text: string) =>
  riWebhookRequest<RiDispositifSummary[]>(DISPOSITIF_SEARCH_PATH, {
    query: { q: text },
  });

export const getRiDispositifsByIds = async (ids: string[]) =>
  ids.length === 0
    ? []
    : riWebhookRequest<RiDispositifSummary[]>(DISPOSITIF_SEARCH_PATH, {
        query: { ids: ids.join(",") },
      });

export const countRiFilterMatches = async (filters: WidgetConfigFilters) =>
  (
    await riWebhookRequest<{ count: number }>(
      `${WIDGET_CONFIG_PATH}/preview-count`,
      { method: "POST", body: { filters } },
    )
  ).count;

export const listRiWidgetConfigs = () =>
  riWebhookRequest<WidgetConfigSummary[]>(WIDGET_CONFIG_PATH);

export const getRiWidgetConfigById = (id: string) =>
  riWebhookRequest<WidgetConfig>(`${WIDGET_CONFIG_PATH}/${id}`);

export const createRiWidgetConfig = (
  email: string,
  widgetConfig: WidgetConfigFields,
) =>
  riWebhookRequest<CreatedWidgetConfigResponse>(
    `${WIDGET_CONFIG_PATH}/create`,
    {
      method: "POST",
      body: { email, widgetConfig },
    },
  );

export const updateRiWidgetConfig = (
  email: string,
  id: string,
  changes: WidgetConfigUpdateInput,
) =>
  riWebhookRequest<{ id: string }>(`${WIDGET_CONFIG_PATH}/update`, {
    method: "PATCH",
    body: { email, widgetConfig: { _id: id, ...changes } },
  });
