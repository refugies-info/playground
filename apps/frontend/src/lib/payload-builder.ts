/**
 * Shared payload builder for preview and publication
 * Centralized construction of dispositif payloads for external APIs
 */

import { stripFirstH1 } from "@playground/shared-types";
import { normalizeMarkdown } from "./markdown/normalizeMarkdown";

export interface DocumentPayloadInput {
  title: string;
  editorialContent: string;
  metadata?: Record<string, unknown>;
}

export interface DispositifPayload {
  dispositif: {
    typeContenu: string;
    theme: string;
    titreInformatif: string;
    origin: string;
    status?: string;
    translations: {
      fr: {
        content: {
          titreInformatif?: string;
          titreMarque?: string;
          abstract?: string;
          markdown: string;
        };
      };
    };
  };
}

/**
 * Payload for publishing to refugies.info (includes email)
 */
export interface PublishPayload extends DispositifPayload {
  email: string;
}

/**
 * Build a dispositif payload for preview or publication
 * @param doc - Document data from the editor
 * @returns Structured payload matching Main App webhook expectations
 */
export async function buildDispositifPayload(
  doc: DocumentPayloadInput,
  status = "Actif",
): Promise<DispositifPayload> {
  const themeId = (doc.metadata?.theme as string) || "63286a015d31b2c0cad99615";

  // Normalize markdown to ensure unambiguous directive nesting
  // This prevents parsing issues in the Main App when it receives nested directives
  // We ALSO strip the first H1 heading for the payload (it's passed in metadata)
  const cleanedMarkdown = await stripFirstH1(doc.editorialContent);
  const normalizedMarkdown = normalizeMarkdown(cleanedMarkdown);

  return {
    dispositif: {
      typeContenu: "dispositif",
      theme: themeId,
      status: status,
      // titreInformatif at root is kept for legacy/compatibility if needed,
      // but important part is in translations based on user example
      titreInformatif: doc.title,
      origin: "RCO",
      translations: {
        fr: {
          content: {
            titreInformatif: doc.title,
            titreMarque: doc.title, // Fallback to title
            abstract: "", // Required field often
            markdown: normalizedMarkdown,
          },
        },
      },
    },
  };
}

/**
 * Build a publish payload (includes user email for the webhook)
 * @param doc - Document data from the editor
 * @param email - Email of the authenticated user
 * @returns Structured payload for publication webhook
 */
export async function buildPublishPayload(
  doc: DocumentPayloadInput,
  email: string,
  status = "Actif",
): Promise<PublishPayload> {
  // buildDispositifPayload already normalizes the markdown
  const basePayload = await buildDispositifPayload(doc, status);
  return {
    ...basePayload,
    email,
  };
}
