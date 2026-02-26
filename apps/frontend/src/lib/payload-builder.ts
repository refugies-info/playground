/**
 * Shared payload builder for preview and publication
 * Centralized construction of dispositif payloads for external APIs
 */

import {
  buildRefugiesInfoPayload,
  type RefugiesInfoPayload,
  stripFirstH1,
} from "@playground/shared-types";
import { normalizeMarkdown } from "./markdown/normalizeMarkdown";

export interface DocumentPayloadInput {
  title: string;
  editorialContent: string;
  metadata?: Record<string, unknown>;
  /** Merged metadata (AI + editorial overrides) for preview/publication */
  mergedMetadata?: Record<string, unknown>;
}

export type DispositifPayload = RefugiesInfoPayload;

/**
 * Payload for publishing to refugies.info (includes email)
 */
export interface PublishPayload extends DispositifPayload {
  email: string;
}

/**
 * Build a dispositif payload for preview or publication
 * Follows the exact contract defined by Réfugiés.info
 * @param doc - Document data from the editor
 * @returns Structured payload matching Main App webhook expectations
 */
export async function buildDispositifPayload(
  doc: DocumentPayloadInput,
  _status = "Actif",
): Promise<DispositifPayload> {
  // Use merged metadata if available, otherwise fall back to basic metadata
  const metadata = doc.mergedMetadata || doc.metadata || {};

  return buildRefugiesInfoPayload({
    title: doc.title,
    markdown: doc.editorialContent,
    metadata,
    origin: "RCO",
    normalizeMarkdown,
  });
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

/**
 * Input for building a translation preview payload
 */
export interface TranslationPreviewInput {
  language: string; // Target language code (e.g., "ar", "en")
  title: string; // Title in target language
  markdown: string; // Markdown content in target language
  sourceMarkdown: string; // Original FR markdown for fallback
  sourceMetadata: Record<string, unknown>; // Metadata from source FR document
}

/**
 * Payload for translation preview (multi-language)
 */
export interface TranslationPreviewPayload {
  dispositif: {
    titreInformatif: string;
    titreMarque: string;
    abstract: string;
    origin: string;
    theme: string;
    secondaryThemes: unknown[];
    needs: unknown[];
    metadatas: Record<string, unknown>;
    translations: Record<
      string,
      {
        content: {
          titreInformatif: string;
          titreMarque: string;
          abstract: string;
          markdown: string;
        };
      }
    >;
  };
}

/**
 * Build a translation preview payload for the preview endpoint
 * Follows the contract defined with Karfur: includes locale, FR fallback, and target translation
 *
 * @param input - Translation preview input data
 * @returns Structured payload for translation preview
 */
export async function buildTranslationPreviewPayload(
  input: TranslationPreviewInput,
): Promise<TranslationPreviewPayload> {
  const themeId =
    (input.sourceMetadata.theme as string) || "63286a015d31b2c0cad99615";

  // Clean and normalize the translation markdown
  const cleanedMarkdown = await stripFirstH1(input.markdown);
  const normalizedMarkdown = normalizeMarkdown(cleanedMarkdown);

  // Source title for FR fallback
  const sourceTitle =
    (input.sourceMetadata.titreInformatif as string) ||
    (input.sourceMetadata.title as string) ||
    "Sans titre";

  // Validate language to prevent prototype pollution
  // Only allow valid locale codes (2-3 lowercase letters)
  if (!/^[a-z]{2,3}$/.test(input.language)) {
    throw new Error("Langue invalide pour le payload");
  }

  // Prevent prototype pollution by rejecting dangerous keys
  const dangerousKeys = ["__proto__", "constructor", "prototype"];
  if (dangerousKeys.includes(input.language)) {
    throw new Error("Langue non autorisée");
  }

  return {
    dispositif: {
      // Fallback FR metadata (always present)
      titreInformatif: sourceTitle,
      titreMarque: (input.sourceMetadata.titreMarque as string) || sourceTitle,
      abstract: (input.sourceMetadata.abstract as string) || "",
      origin: "RCO",
      theme: themeId,
      secondaryThemes:
        (input.sourceMetadata.secondaryThemes as unknown[]) || [],
      needs: (input.sourceMetadata.needs as unknown[]) || [],
      metadatas:
        (input.sourceMetadata.metadatas as Record<string, unknown>) || {},

      // Translations: both FR (source) and target language
      translations: {
        fr: {
          content: {
            titreInformatif: sourceTitle,
            titreMarque:
              (input.sourceMetadata.titreMarque as string) || sourceTitle,
            abstract: (input.sourceMetadata.abstract as string) || "",
            markdown: input.sourceMarkdown,
          },
        },
        [input.language]: {
          content: {
            titreInformatif: input.title,
            titreMarque: "", // Usually empty for translations
            abstract: "",
            markdown: normalizedMarkdown,
          },
        },
      },
    },
  };
}
