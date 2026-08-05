import {
  buildRefugiesInfoPayload,
  stripFirstH1,
} from "@playground/shared-types";
import type { PublisherAdapter, WebhookPayload } from "./types";

/**
 * Refugies.info publisher adapter.
 *
 * Handles publication to the refugies.info platform via webhook.
 * Uses environment variables for configuration.
 */
export const refugiesInfoAdapter: PublisherAdapter = {
  platform: "refugies.info",

  getWebhookUrl(
    action?: "create" | "update" | "translation" | "archive",
  ): string {
    const baseUrl = process.env.RI_BASE_URL;
    if (!baseUrl) {
      throw new Error("RI_BASE_URL is not configured");
    }
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    if (action === "create")
      return `${cleanBaseUrl}/api/webhook/dispositif/create`;
    if (action === "update")
      return `${cleanBaseUrl}/api/webhook/dispositif/update`;
    if (action === "translation")
      return `${cleanBaseUrl}/api/webhook/dispositif/translation`;
    if (action === "archive")
      return `${cleanBaseUrl}/api/webhook/dispositif/archive`;

    // Fallback to legacy
    return `${cleanBaseUrl}/api/webhook/dispositif`;
  },

  async buildPayload(doc): Promise<WebhookPayload> {
    const { title, markdown, metadata, userEmail, existingRemoteId } = doc;

    const { dispositif } = await buildRefugiesInfoPayload({
      title,
      markdown,
      metadata,
      origin: existingRemoteId ? undefined : "RCO",
    });

    if (existingRemoteId) {
      // UPDATE payload: _id + dispositif data (no origin)
      return {
        email: userEmail,
        dispositif: {
          _id: existingRemoteId,
          ...dispositif,
        },
      };
    }

    // CREATE payload: origin + full data. NO _id.
    return {
      email: userEmail,
      dispositif: {
        ...dispositif,
        webOnly: false,
      },
    };
  },

  buildPublishedUrl(remoteId: string): string {
    const baseUrl = process.env.RI_BASE_URL || "https://refugies.info";
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    return `${cleanBaseUrl}/dispositif/${remoteId}`;
  },

  async buildTranslationPayload(doc): Promise<WebhookPayload> {
    const { language, title, markdown, abstract, existingRemoteId, userEmail } =
      doc;

    // Strip the first H1 heading for the translation payload
    const cleanedMarkdown = await stripFirstH1(markdown);

    return {
      email: userEmail,
      dispositif: {
        _id: existingRemoteId,
        translations: {
          [language]: {
            content: {
              titreInformatif: title,
              titreMarque: "", // Usually fixed or copied from FR
              abstract: abstract ?? "",
              markdown: cleanedMarkdown,
            },
          },
        },
      },
    };
  },

  async buildArchivePayload(doc): Promise<WebhookPayload> {
    return {
      email: doc.userEmail,
      dispositif: {
        _id: doc.existingRemoteId,
      },
    };
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
