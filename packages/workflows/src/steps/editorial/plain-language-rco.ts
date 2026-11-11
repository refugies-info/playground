import { askPlainLanguageAgent, createLettaClient } from "@playground/agents";
import {
  type RcoActionDocument,
  renderPlainLanguageFiche,
  toPlainLanguageDocument,
} from "@playground/offre-info";
import { FatalError } from "@workflow/errors";

export async function generateRcoPlainLanguage(action: RcoActionDocument) {
  const agentId = process.env.RCO_PLAIN_LANGUAGE_AGENT_ID;
  if (!agentId) {
    throw new FatalError(
      "RCO_PLAIN_LANGUAGE_AGENT_ID is not defined (pnpm agents:sync)",
    );
  }

  const { answer, usage } = await askPlainLanguageAgent(
    createLettaClient(),
    agentId,
    action.id,
    toPlainLanguageDocument(action),
  );

  return {
    agentId,
    content: renderPlainLanguageFiche(answer, action),
    usage,
  };
}
