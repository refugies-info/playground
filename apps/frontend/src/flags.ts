import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

/**
 * Feature flag to disable the chat sidebar in the document editor.
 *
 * When true, the chat sidebar is hidden from the UI.
 * When false (default), the chat sidebar is visible.
 */
export const disableChatSidebar = flag<boolean>({
  key: "disable-chat-sidebar",
  adapter: vercelAdapter(),
});
