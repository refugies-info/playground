/**
 * GET /api/letta/conversation?agent=metadata&actionId=…
 *
 * Opens the last Letta conversation of an RCO agent for one fiche. Resolved
 * by name at click time, so a run that failed before persisting anything
 * stays reachable. Réservé aux admins.
 */

import { createLettaClient, findConversation } from "@playground/agents";
import { logger } from "@playground/shared-types";
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildLettaConversationUrl } from "@/lib/url-builder";

// Conversation names match the agents' askAgent calls: `<agent>-<actionId>`.
const RCO_AGENT_ENV = {
  compliance: "RCO_COMPLIANCE_AGENT_ID",
  duplicates: "RCO_DUPLICATES_AGENT_ID",
  metadata: "RCO_METADATA_AGENT_ID",
  "plain-language": "RCO_PLAIN_LANGUAGE_AGENT_ID",
} as const;

type RcoAgent = keyof typeof RCO_AGENT_ENV;

const isRcoAgent = (value: string | null): value is RcoAgent =>
  value !== null && Object.hasOwn(RCO_AGENT_ENV, value);

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== "admin") {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 });
  }

  const agent = request.nextUrl.searchParams.get("agent");
  const actionId = request.nextUrl.searchParams.get("actionId");
  if (!isRcoAgent(agent) || !actionId) {
    return NextResponse.json(
      { error: "Paramètres invalides" },
      { status: 400 },
    );
  }

  const agentId = process.env[RCO_AGENT_ENV[agent]];
  if (!agentId) {
    return NextResponse.json(
      { error: `${RCO_AGENT_ENV[agent]} manquant` },
      { status: 500 },
    );
  }

  // Without a conversation (agent never called), the agent page still helps.
  const conversationId = await findConversation(
    createLettaClient(),
    agentId,
    `${agent}-${actionId}`,
  ).catch((error) => {
    logger.warn(
      { error, agent, actionId },
      "[letta] Conversation lookup failed",
    );
    return null;
  });

  return NextResponse.redirect(
    buildLettaConversationUrl(agentId, conversationId),
  );
}
