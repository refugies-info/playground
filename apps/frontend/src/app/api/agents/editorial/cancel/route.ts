import { createLettaClient } from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  flowId: z.string().min(1),
});

/**
 * Annule les runs Letta en cours pour un workflow donné.
 * Appelé côté client quand l'utilisateur clique sur "Annuler" (FAB en mode loading).
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parseResult = bodySchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(JSON.stringify({ error: "flowId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { flowId } = parseResult.data;
  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    return new Response("Server configuration error", { status: 500 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return new Response("Server configuration error", { status: 500 });
  }

  // Récupérer le conversation_id pour le log (optionnel mais utile)
  const supabase = getSupabaseAdmin(url, key);
  const { data: workflow } = await supabase
    .from("workflows")
    .select("conversation_id")
    .eq("id", flowId)
    .single();

  logger.info(
    { flowId, conversationId: workflow?.conversation_id, agentId },
    "Cancelling Letta runs for agent",
  );

  try {
    const client = createLettaClient();
    // Sans run_ids → annule tous les runs actifs de l'agent
    await client.agents.messages.cancel(agentId);

    logger.info({ flowId, agentId }, "Letta runs cancelled");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error({ error, flowId, agentId }, "Failed to cancel Letta runs");
    return new Response(JSON.stringify({ error: "Failed to cancel" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
