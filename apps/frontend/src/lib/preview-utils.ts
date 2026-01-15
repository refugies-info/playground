import { getPreviewSecret } from "@/services/document-actions";
import { buildDispositifPayload } from "./payload-builder";

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
  const payload = buildDispositifPayload({
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
