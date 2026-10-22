import { z } from "zod";
import type { RcoClient } from "./client";
import {
  RCO_CERTIFINFO_CODES,
  RCO_CONVENTIONNEMENT,
  RCO_FINANCEUR_CODES,
  RCO_FORMACODES,
  RCO_SEARCH_FIELDS,
  RCO_SEARCH_PAGE_LIMIT,
} from "./config";
import { normalizeSession } from "./normalize";
import type { SessionOffre } from "./session-offre";

export type RcoActionSessions = {
  numeroAction: string;
  sessions: SessionOffre[];
};

const SearchPageSchema = z.object({
  total: z.number(),
  limit: z.number(),
  results: z.array(z.unknown()),
});

// /recherche filters on conventionnement but cannot return it.
const toSearchSession = (raw: unknown): SessionOffre => ({
  ...normalizeSession(raw, RCO_SEARCH_FIELDS),
  conventionnement: RCO_CONVENTIONNEMENT,
});

export async function searchActionSessions(
  client: RcoClient,
): Promise<RcoActionSessions[]> {
  const sessionsByAction = new Map<string, SessionOffre[]>();

  for (let page = 1; ; page++) {
    const response = SearchPageSchema.parse(
      await client.get("/recherche", {
        formacode: RCO_FORMACODES.join(","),
        certifinfo: RCO_CERTIFINFO_CODES.join(","),
        conventionnement: RCO_CONVENTIONNEMENT,
        code_financeur: RCO_FINANCEUR_CODES.join(","),
        codes_operator: "OR",
        fields: RCO_SEARCH_FIELDS.join(","),
        limit: RCO_SEARCH_PAGE_LIMIT,
        page,
      }),
    );
    for (const session of response.results.map(toSearchSession)) {
      const sessions = sessionsByAction.get(session.numero_action) ?? [];
      sessionsByAction.set(session.numero_action, [...sessions, session]);
    }

    const isLastPage =
      response.results.length === 0 || page * response.limit >= response.total;
    if (isLastPage) {
      return [...sessionsByAction].map(([numeroAction, sessions]) => ({
        numeroAction,
        sessions,
      }));
    }
  }
}
