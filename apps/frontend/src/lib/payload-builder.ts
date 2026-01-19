/**
 * Shared payload builder for preview and publication
 * Centralized construction of dispositif payloads for external APIs
 */

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
export function buildDispositifPayload(
  doc: DocumentPayloadInput,
  status = "Actif",
): DispositifPayload {
  const themeId = (doc.metadata?.theme as string) || "63286a015d31b2c0cad99615";

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
            markdown: doc.editorialContent,
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
export function buildPublishPayload(
  doc: DocumentPayloadInput,
  email: string,
  status = "Actif",
): PublishPayload {
  const basePayload = buildDispositifPayload(doc, status);
  return {
    ...basePayload,
    email,
  };
}
