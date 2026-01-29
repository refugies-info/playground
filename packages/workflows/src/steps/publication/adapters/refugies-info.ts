import type { PublisherAdapter, WebhookPayload } from "./types";

/**
 * Refugies.info publisher adapter.
 *
 * Handles publication to the refugies.info platform via webhook.
 * Uses environment variables for configuration.
 */
export const refugiesInfoAdapter: PublisherAdapter = {
  platform: "refugies.info",

  getWebhookUrl(): string {
    const baseUrl = process.env.RI_BASE_URL;
    if (!baseUrl) {
      throw new Error("RI_BASE_URL is not configured");
    }
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    return `${cleanBaseUrl}/api/webhook/dispositif`;
  },

  buildPayload(doc): WebhookPayload {
    const themeId =
      (doc.metadata?.theme as string) || "63286a015d31b2c0cad99615";
    const status = doc.status || "Actif";

    return {
      email: doc.userEmail,
      dispositif: {
        typeContenu: "dispositif",
        theme: themeId,
        status: status,
        titreInformatif: doc.title,
        origin: "RCO",
        ...(doc.existingRemoteId ? { _id: doc.existingRemoteId } : {}),
        translations: {
          fr: {
            content: {
              titreInformatif: doc.title,
              titreMarque: doc.title,
              abstract: "",
              markdown: doc.markdown,
            },
          },
        },
      },
    };
  },

  buildPublishedUrl(remoteId: string): string {
    const baseUrl = process.env.RI_BASE_URL || "https://refugies.info";
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    return `${cleanBaseUrl}/dispositif/${remoteId}`;
  },
};

/**
 * Gets the appropriate publisher adapter for a given platform.
 *
 * @param platform - The target platform identifier
 * @returns The publisher adapter for the platform
 * @throws Error if platform is not supported
 */
export function getPublisherAdapter(platform: string): PublisherAdapter {
  switch (platform) {
    case "refugies.info":
      return refugiesInfoAdapter;
    // Future: case "etrangers.info": return etrangersInfoAdapter;
    default:
      throw new Error(`Unsupported publication platform: ${platform}`);
  }
}
