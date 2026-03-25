import { disableChatSidebar } from "@/flags";
import { AssistantPanel } from "./AssistantPanel";

/**
 * Server Component wrapper that evaluates the feature flag
 * and passes it to the client-side AssistantPanel.
 */
export async function AssistantPanelContainer() {
  const isChatDisabled = await disableChatSidebar();
  return <AssistantPanel disableChatSidebar={isChatDisabled} />;
}
