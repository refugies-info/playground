import { askPlainLanguageAgent, createLettaClient } from "@playground/agents";
import {
  type RcoActionDocument,
  renderPlainLanguageFiche,
  toPlainLanguageDocument,
} from "@playground/offre-info";
import { RCO_MODEL_HANDLE } from "@playground/shared-types";
import { FatalError } from "@workflow/errors";

export async function generateRcoPlainLanguage(
  action: RcoActionDocument,
  model = RCO_MODEL_HANDLE,
  onConversation?: (conversationId: string) => Promise<void>,
) {
  const agentId = process.env.RCO_PLAIN_LANGUAGE_AGENT_ID;
  if (!agentId) {
    throw new FatalError(
      "RCO_PLAIN_LANGUAGE_AGENT_ID is not defined (pnpm agents:sync)",
    );
  }

  const { answer, usage, conversationId } = await askPlainLanguageAgent(
    createLettaClient(),
    agentId,
    action.id,
    toPlainLanguageDocument(action),
    model,
    onConversation,
  );

  return {
    agentId,
    conversationId,
    model,
    content: renderPlainLanguageFiche(answer, action),
    usage,
  };
}
