/**
 * Shared payload builder for preview and publication
 * Centralized construction of dispositif payloads for external APIs
 */

import { stripFirstH1 } from "@playground/shared-types";
import { normalizeMarkdown } from "./markdown/normalizeMarkdown";

// Default theme ID for dispositif preview/payload ("Apprendre le français")
const DEFAULT_THEME_ID = "63286a015d31b2c0cad99615";

export interface DocumentPayloadInput {
  title: string;
  editorialContent: string;
  metadata?: Record<string, unknown>;
  /** Merged metadata (AI + editorial overrides) for preview/publication */
  mergedMetadata?: Record<string, unknown>;
}

export interface DispositifPayload {
  dispositif: {
    origin: "RCO";
    theme: string;
    secondaryThemes: unknown[];
    needs: unknown[];
    sponsors: Array<{ name: string; logo?: string; link?: string }>;
    metadatas: Record<string, unknown>;
    translations: {
      fr: {
        content: {
          titreInformatif: string;
          titreMarque: string;
          abstract: string;
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
 * Follows the exact contract defined by Réfugiés.info
 * @param doc - Document data from the editor
 * @returns Structured payload matching Main App webhook expectations
 */
export async function buildDispositifPayload(
  doc: DocumentPayloadInput,
  status = "Actif",
): Promise<DispositifPayload> {
  // Use merged metadata if available, otherwise fall back to basic metadata
  const metadata = doc.mergedMetadata || doc.metadata || {};

  // Root level fields
  const themeId = (metadata.theme as string) || DEFAULT_THEME_ID;
  const secondaryThemes = (metadata.secondaryThemes as unknown[]) || [];
  const needs = (metadata.needs as unknown[]) || [];
  const titreMarque = (metadata.titreMarque as string) || doc.title;
  const abstract = (metadata.abstract as string) || "";

  // Build metadatas object (structured metadata for RI)
  const metadatas: Record<string, unknown> = {};

  // Only include defined fields (avoid sending undefined/null)
  if (metadata.location !== undefined) metadatas.location = metadata.location;
  if (metadata.frenchLevel !== undefined)
    metadatas.frenchLevel = metadata.frenchLevel;
  if (metadata.age !== undefined) metadatas.age = metadata.age;
  if (metadata.price !== undefined) metadatas.price = metadata.price;
  if (metadata.publicStatus !== undefined)
    metadatas.publicStatus = metadata.publicStatus;
  if (metadata.public !== undefined) metadatas.public = metadata.public;
  if (metadata.conditions !== undefined)
    metadatas.conditions = metadata.conditions;
  if (metadata.commitment !== undefined)
    metadatas.commitment = metadata.commitment;
  if (metadata.frequency !== undefined)
    metadatas.frequency = metadata.frequency;
  if (metadata.timeSlots !== undefined)
    metadatas.timeSlots = metadata.timeSlots;
  // Map periode (MongoDB format) → sessions (RI format)
  if (Array.isArray(metadata.periode) && metadata.periode.length > 0) {
    metadatas.sessions = metadata.periode.map((session: unknown) => {
      // Convert MongoDB $date format to ISO string
      const convertDate = (dateObj: unknown): string | undefined => {
        if (!dateObj) return undefined;
        if (typeof dateObj === "string") return dateObj;
        if (typeof dateObj === "object" && dateObj !== null) {
          return (dateObj as { $date?: string }).$date;
        }
        return undefined;
      };

      // Handle both formats:
      // MongoDB: { debut: { $date: "..." }, fin: { $date: "..." } }
      // Direct: { startDate: "...", endDate: "..." }
      const s = session as {
        debut?: { $date?: string } | string;
        fin?: { $date?: string } | string;
        startDate?: string;
        endDate?: string;
        inscription?: { debut?: { $date?: string }; fin?: { $date?: string } };
        registrationStartDate?: { $date?: string } | string;
        registrationEndDate?: { $date?: string } | string;
        externalRef?: string;
        url?: string;
      };

      const startDate =
        convertDate(s.debut) || s.startDate || "1970-01-01T00:00:00.000Z";
      const endDate =
        convertDate(s.fin) || s.endDate || "1970-01-01T00:00:00.000Z";

      const result: {
        startDate: string;
        endDate: string;
        registrationStartDate?: string;
        registrationEndDate?: string;
        externalRef?: string;
        url?: string;
      } = { startDate, endDate };

      // Optional registration dates
      const regStart =
        convertDate(s.registrationStartDate) ||
        convertDate(s.inscription?.debut);
      const regEnd =
        convertDate(s.registrationEndDate) || convertDate(s.inscription?.fin);

      if (regStart) result.registrationStartDate = regStart;
      if (regEnd) result.registrationEndDate = regEnd;
      if (s.externalRef) result.externalRef = s.externalRef;
      if (s.url) result.url = s.url;

      return result;
    });
  }

  // Build sponsors array from mainSponsor (at root level, not in metadatas)
  const sponsors: Array<{ name: string; logo?: string; link?: string }> = [];
  if (metadata.mainSponsor !== undefined && metadata.mainSponsor !== "") {
    sponsors.push({
      name: metadata.mainSponsor as string,
      // logo and link are optional and will be added later
    });
  }

  // Normalize markdown
  const cleanedMarkdown = await stripFirstH1(doc.editorialContent);
  const normalizedMarkdown = normalizeMarkdown(cleanedMarkdown);

  const payload: DispositifPayload = {
    dispositif: {
      origin: "RCO",
      // Root level metadata fields
      theme: themeId,
      secondaryThemes,
      needs,
      sponsors,
      // Structured metadatas object
      metadatas,
      // Translations contain titreMarque, titreInformatif, abstract
      translations: {
        fr: {
          content: {
            titreInformatif: doc.title,
            titreMarque,
            abstract,
            markdown: normalizedMarkdown,
          },
        },
      },
    },
  };

  return payload;
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
