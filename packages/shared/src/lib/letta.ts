export const buildLettaConversationUrl = (
  agentId: string,
  conversationId?: string | null,
) =>
  `https://chat.letta.com/chat/${agentId}${conversationId ? `?conversation=${conversationId}` : ""}`;
