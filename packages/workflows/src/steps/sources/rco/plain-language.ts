import { askPlainLanguageAgent, createLettaClient } from "@playground/agents";
import {
  fetchActionDetail,
  getRcoClientFromEnv,
  type RcoActionDocument,
  renderPlainLanguageFiche,
  toPlainLanguageDocument,
} from "@playground/rco-offre-info";
import { SOURCE_MODEL_HANDLE } from "@playground/shared-types";
import { FatalError } from "@workflow/errors";

export async function generateRcoPlainLanguage({
  serviceData,
  model = SOURCE_MODEL_HANDLE,
  linkConversation,
}: {
  serviceData: unknown;
  model?: string;
  linkConversation: (conversationId: string) => Promise<void>;
}) {
  const action = await fetchActionDetail(
    getRcoClientFromEnv(),
    serviceData as RcoActionDocument,
  );
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
    linkConversation,
  );

  return {
    agentId,
    conversationId,
    model,
    content: renderPlainLanguageFiche(answer, action),
    usage,
  };
}
