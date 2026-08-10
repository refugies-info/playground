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
   * @param action - Optional action to determine the specific endpoint (e.g., 'create', 'update', 'translation', 'archive')
   * @returns The webhook endpoint URL
   */
  getWebhookUrl(
    action?: "create" | "update" | "translation" | "archive",
  ): string;

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

  /**
   * Builds the platform-specific payload for a translation update.
   * @param doc - The translation document details
   * @returns Formatted webhook payload
   */
  buildTranslationPayload(doc: {
    language: string;
    title: string;
    markdown: string;
    /** Traduction du « En bref » (RI-1379) — absente tant qu'elle n'est pas saisie */
    abstract?: string;
    existingRemoteId: string;
    userEmail: string;
  }): WebhookPayload | Promise<WebhookPayload>;

  /**
   * Builds the platform-specific payload for archiving a document.
   * @param doc - The document details to archive
   * @returns Formatted webhook payload
   */
  buildArchivePayload(doc: {
    existingRemoteId: string;
    userEmail: string;
  }): WebhookPayload | Promise<WebhookPayload>;
}
