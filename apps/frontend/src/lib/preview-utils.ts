import { getPreviewSecret } from "@/services/document-actions";
import {
  buildDispositifPayload,
  buildTranslationPreviewPayload,
} from "./payload-builder";

interface PreviewDocument {
  id?: string;
  title: string;
  editorialContent: string;
  metadata?: Record<string, unknown>;
}

/**
 * Handles the preview submission process:
 * 1. Prepares the payload from the document
 * 2. Fetches the secure webhook secret via Server Action
 * 3. Creates and submits a hidden form to the Main App
 */
export const submitPreview = async (document: PreviewDocument) => {
  // Build the preview payload using shared builder
  const payload = await buildDispositifPayload({
    title: document.title,
    editorialContent: document.editorialContent,
    metadata: document.metadata,
  });

  // Get preview URL from client-side env vars
  const previewUrl =
    process.env.NEXT_PUBLIC_PREVIEW_URL ||
    "http://localhost:3000/dispositif/preview";

  // Fetch secret via Server Action
  const secretResult = await getPreviewSecret();

  if (!secretResult.success || !secretResult.secret) {
    throw new Error(
      secretResult.error ||
        "Impossible de récupérer le secret de prévisualisation",
    );
  }

  // Create a Hidden Form
  const form = window.document.createElement("form");
  form.method = "POST";
  form.action = previewUrl;
  form.target = "_blank"; // Open in new tab
  form.rel = "noopener noreferrer"; // Security best practice

  // Field: JSON Payload
  const input = window.document.createElement("input");
  input.type = "hidden";
  input.name = "json";
  input.value = JSON.stringify(payload);
  form.appendChild(input);

  // Field: Webhook Secret
  const secretInput = window.document.createElement("input");
  secretInput.type = "hidden";
  secretInput.name = "webhook-secret";
  secretInput.value = secretResult.secret;
  form.appendChild(secretInput);

  // Submit and Cleanup
  window.document.body.appendChild(form);
  form.submit();

  // Use setTimeout to ensure the submit event fires before removal
  setTimeout(() => {
    window.document.body.removeChild(form);
  }, 0);
};

/**
 * Input for translation preview submission
 */
export interface TranslationPreviewDocument {
  language: string; // Target language code (e.g., "ar", "en")
  title: string; // Title in target language
  translationMarkdown: string; // Markdown content in target language
  sourceMarkdown: string; // Original FR markdown
  sourceMetadata: Record<string, unknown>; // Metadata from source document
}

/**
 * Handles the translation preview submission process:
 * 1. Prepares the payload with both FR fallback and target translation
 * 2. Fetches the secure webhook secret via Server Action
 * 3. Creates and submits a hidden form to the Main App with locale in URL path
 *
 * Contract: POST /{locale}/dispositif/preview (e.g., /ar/dispositif/preview)
 */
export const submitTranslationPreview = async (
  document: TranslationPreviewDocument,
) => {
  // Build the translation preview payload (without locale field)
  const payload = await buildTranslationPreviewPayload({
    language: document.language,
    title: document.title,
    markdown: document.translationMarkdown,
    sourceMarkdown: document.sourceMarkdown,
    sourceMetadata: document.sourceMetadata,
  });

  // Get base URL from client-side env vars
  const baseUrl = process.env.RI_BASE_URL || "http://localhost:3000";

  // Build locale-specific preview URL: /{locale}/dispositif/preview
  const previewUrl = `${baseUrl.replace(/\/$/, "")}/${document.language}/dispositif/preview`;

  // Fetch secret via Server Action
  const secretResult = await getPreviewSecret();

  if (!secretResult.success || !secretResult.secret) {
    throw new Error(
      secretResult.error ||
        "Impossible de récupérer le secret de prévisualisation",
    );
  }

  // Create a Hidden Form
  const form = window.document.createElement("form");
  form.method = "POST";
  form.action = previewUrl;
  form.target = "_blank"; // Open in new tab
  form.rel = "noopener noreferrer"; // Security best practice

  // Field: JSON Payload (translations only, no locale field)
  const input = window.document.createElement("input");
  input.type = "hidden";
  input.name = "json";
  input.value = JSON.stringify(payload);
  form.appendChild(input);

  // Field: Webhook Secret
  const secretInput = window.document.createElement("input");
  secretInput.type = "hidden";
  secretInput.name = "webhook-secret";
  secretInput.value = secretResult.secret;
  form.appendChild(secretInput);

  // Submit and Cleanup
  window.document.body.appendChild(form);
  form.submit();

  // Use setTimeout to ensure the submit event fires before removal
  setTimeout(() => {
    window.document.body.removeChild(form);
  }, 0);
};
