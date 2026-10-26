import { z } from "zod";
import type { RcoClient } from "./client";
import { buildActionDocument, type RcoActionDocument } from "./document";
import { normalizeSession } from "./normalize";
import type { SessionOffre } from "./session-offre";

export async function fetchActionSessions(
  client: RcoClient,
  numeroAction: string,
): Promise<SessionOffre[]> {
  const body = await client.get("/offre", { numero_action: numeroAction });
  if (body === null) return [];
  return z
    .array(z.unknown())
    .parse(body)
    .map((raw) => normalizeSession(raw));
}

// Stored documents come from /recherche, which omits the detail the AI steps
// need (contenu, lieux, financeurs...): read it from /offre on demand.
export async function fetchActionDetail(
  client: RcoClient,
  stored: RcoActionDocument,
): Promise<RcoActionDocument> {
  const sessions = await fetchActionSessions(client, stored.numero_action);
  return sessions.length === 0
    ? stored
    : buildActionDocument(sessions, stored.structure_id);
}
