"use server";

import {
  canManageWidgets,
  logger,
  type RiDispositifSummary,
  type WidgetConfig,
  type WidgetConfigFields,
  type WidgetConfigFilters,
  type WidgetConfigSummary,
  type WidgetConfigUpdateInput,
} from "@playground/shared-types";
import { getCurrentUser } from "@/lib/auth";
import { buildDuplicate } from "@/lib/widget-list";
import type { RiWebhookError } from "./ri/webhook-client";
import {
  countRiFilterMatches,
  createRiWidgetConfig,
  deleteRiWidgetConfig,
  getRiDispositifsByIds,
  getRiWidgetConfigById,
  listRiWidgetConfigs,
  searchRiDispositifs,
  updateRiWidgetConfig,
} from "./ri/widget-configs";

const ACTION_NAMES = {
  listWidgetConfigs: "listWidgetConfigs",
  getWidgetConfig: "getWidgetConfig",
  createWidgetConfig: "createWidgetConfig",
  updateWidgetConfig: "updateWidgetConfig",
  duplicateWidgetConfig: "duplicateWidgetConfig",
  deleteWidgetConfig: "deleteWidgetConfig",
  searchDispositifs: "searchDispositifs",
  getDispositifsByIds: "getDispositifsByIds",
  countFilterMatches: "countFilterMatches",
} as const;

export type WidgetConfigActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      fieldErrors?: { key: string; message: string }[];
    };

const ERROR_MESSAGES: Partial<Record<number, string>> = {
  400: "Les données du widget sont invalides",
  409: "Ce widget a déjà été actif : il ne peut pas être supprimé",
};

const getErrorMessage = (status = 0) =>
  ERROR_MESSAGES[status] ?? "Impossible de joindre Refugies.info";

/** A server action can be called without going through the page: it checks the role itself. */
async function runAsWidgetManager<T>(
  actionName: (typeof ACTION_NAMES)[keyof typeof ACTION_NAMES],
  action: (email: string) => Promise<T>,
): Promise<WidgetConfigActionResult<T>> {
  const { id, email, role } = await getCurrentUser();

  if (!canManageWidgets(role)) {
    logger.warn(
      { userId: id, role },
      `Unauthorized widget config action: ${actionName}`,
    );
    return { success: false, error: "Accès refusé" };
  }

  try {
    return { success: true, data: await action(email) };
  } catch (error) {
    logger.error(error, `Widget config action failed: ${actionName}`);
    const { status, details } = error as Partial<RiWebhookError>;
    return {
      success: false,
      error: getErrorMessage(status),
      fieldErrors: Array.isArray(details) ? details : undefined,
    };
  }
}

export async function searchDispositifsAction(
  text: string,
): Promise<WidgetConfigActionResult<RiDispositifSummary[]>> {
  return runAsWidgetManager(ACTION_NAMES.searchDispositifs, () =>
    searchRiDispositifs(text),
  );
}

export async function getDispositifsByIdsAction(
  ids: string[],
): Promise<WidgetConfigActionResult<RiDispositifSummary[]>> {
  return runAsWidgetManager(ACTION_NAMES.getDispositifsByIds, () =>
    getRiDispositifsByIds(ids),
  );
}

export async function countFilterMatchesAction(
  filters: WidgetConfigFilters,
): Promise<WidgetConfigActionResult<number>> {
  return runAsWidgetManager(ACTION_NAMES.countFilterMatches, () =>
    countRiFilterMatches(filters),
  );
}

export async function listWidgetConfigsAction(): Promise<
  WidgetConfigActionResult<WidgetConfigSummary[]>
> {
  return runAsWidgetManager(ACTION_NAMES.listWidgetConfigs, () =>
    listRiWidgetConfigs(),
  );
}

export async function getWidgetConfigAction(
  id: string,
): Promise<WidgetConfigActionResult<WidgetConfig>> {
  return runAsWidgetManager(ACTION_NAMES.getWidgetConfig, () =>
    getRiWidgetConfigById(id),
  );
}

export async function createWidgetConfigAction(
  widgetConfig: WidgetConfigFields,
) {
  return runAsWidgetManager(ACTION_NAMES.createWidgetConfig, (email) =>
    createRiWidgetConfig(email, widgetConfig),
  );
}

export async function updateWidgetConfigAction(
  id: string,
  changes: WidgetConfigUpdateInput,
) {
  return runAsWidgetManager(ACTION_NAMES.updateWidgetConfig, (email) =>
    updateRiWidgetConfig(email, id, changes),
  );
}

export async function duplicateWidgetConfigAction(id: string) {
  return runAsWidgetManager(ACTION_NAMES.duplicateWidgetConfig, async (email) =>
    createRiWidgetConfig(
      email,
      buildDuplicate(await getRiWidgetConfigById(id)),
    ),
  );
}

export async function deleteWidgetConfigAction(id: string) {
  return runAsWidgetManager(ACTION_NAMES.deleteWidgetConfig, (email) =>
    deleteRiWidgetConfig(email, id),
  );
}
