import { z } from "zod";
import type { RcoClient } from "./client";
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
