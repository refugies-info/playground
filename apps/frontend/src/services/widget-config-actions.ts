"use server";

import {
  logger,
  type RiDispositifSummary,
  type WidgetConfig,
  type WidgetConfigFields,
  type WidgetConfigFilters,
  type WidgetConfigSummary,
  type WidgetConfigUpdateInput,
} from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import type { RiWebhookError } from "./ri/webhook-client";
import {
  countRiFilterMatches,
  createRiWidgetConfig,
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

async function runAsAuthenticatedUser<T>(
  actionName: (typeof ACTION_NAMES)[keyof typeof ACTION_NAMES],
  action: (email: string) => Promise<T>,
): Promise<WidgetConfigActionResult<T>> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: "Utilisateur non authentifié" };
  }

  try {
    return { success: true, data: await action(user.email) };
  } catch (error) {
    logger.error(error, `Widget config action failed: ${actionName}`);
    const { status, details } = error as Partial<RiWebhookError>;
    return {
      success: false,
      error:
        status === 400
          ? "Les données du widget sont invalides"
          : "Impossible de joindre Refugies.info",
      fieldErrors: Array.isArray(details) ? details : undefined,
    };
  }
}

export async function searchDispositifsAction(
  text: string,
): Promise<WidgetConfigActionResult<RiDispositifSummary[]>> {
  return runAsAuthenticatedUser(ACTION_NAMES.searchDispositifs, () =>
    searchRiDispositifs(text),
  );
}

export async function getDispositifsByIdsAction(
  ids: string[],
): Promise<WidgetConfigActionResult<RiDispositifSummary[]>> {
  return runAsAuthenticatedUser(ACTION_NAMES.getDispositifsByIds, () =>
    getRiDispositifsByIds(ids),
  );
}

export async function countFilterMatchesAction(
  filters: WidgetConfigFilters,
): Promise<WidgetConfigActionResult<number>> {
  return runAsAuthenticatedUser(ACTION_NAMES.countFilterMatches, () =>
    countRiFilterMatches(filters),
  );
}

export async function listWidgetConfigsAction(): Promise<
  WidgetConfigActionResult<WidgetConfigSummary[]>
> {
  return runAsAuthenticatedUser(ACTION_NAMES.listWidgetConfigs, () =>
    listRiWidgetConfigs(),
  );
}

export async function getWidgetConfigAction(
  id: string,
): Promise<WidgetConfigActionResult<WidgetConfig>> {
  return runAsAuthenticatedUser(ACTION_NAMES.getWidgetConfig, () =>
    getRiWidgetConfigById(id),
  );
}

export async function createWidgetConfigAction(
  widgetConfig: WidgetConfigFields,
) {
  return runAsAuthenticatedUser(ACTION_NAMES.createWidgetConfig, (email) =>
    createRiWidgetConfig(email, widgetConfig),
  );
}

export async function updateWidgetConfigAction(
  id: string,
  changes: WidgetConfigUpdateInput,
) {
  return runAsAuthenticatedUser(ACTION_NAMES.updateWidgetConfig, (email) =>
    updateRiWidgetConfig(email, id, changes),
  );
}
