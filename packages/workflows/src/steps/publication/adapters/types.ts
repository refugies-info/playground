import type { PublicationPlatform } from "../../../types";

/**
 * Payload structure for publication webhooks.
 */
export type WebhookPayload = Record<string, unknown>;

/**
 * Response from a publication webhook.
 */
export interface WebhookResponse {
  success: boolean;
  remoteId?: string;
  error?: string;
}

/**
 * Interface for platform-specific publication adapters.
 * Implement this interface to add support for new publication platforms.
 *
 * @example
 * ```typescript
 * const refugiesInfoAdapter: PublisherAdapter = {
 *   platform: "refugies.info",
 *   getWebhookUrl() { return process.env.RI_WEBHOOK_URL; },
 *   buildPayload(doc) { ... },
 *   buildPublishedUrl(remoteId) { return `https://refugies.info/dispositif/${remoteId}`; },
 * };
 * ```
 */
export interface PublisherAdapter {
  /** Unique identifier for this platform */
  platform: PublicationPlatform;

  /**
   * Returns the webhook URL for this platform.
   * @returns The webhook endpoint URL
   */
  getWebhookUrl(): string;

  /**
   * Builds the platform-specific payload for the webhook.
   * @param doc - The document to publish
   * @returns Formatted webhook payload
   */
  buildPayload(doc: {
    title: string;
    markdown: string;
    metadata: Record<string, unknown>;
    userEmail: string;
    status?: string;
    existingRemoteId?: string;
  }): WebhookPayload | Promise<WebhookPayload>;

  /**
   * Generates the public URL for a published document.
   * @param remoteId - The ID assigned by the remote platform
   * @returns Full public URL to the published content
   */
  buildPublishedUrl(remoteId: string): string;
}
