import { getPreviewSecret, getPreviewUrl } from "@/services/document-actions";

interface PreviewDocument {
  id?: string;
  title: string;
  editorialContent: string;
  metadata?: Record<string, any>;
}

/**
 * Handles the preview submission process:
 * 1. Prepares the payload from the document
 * 2. Fetches the secure webhook secret via Server Action
 * 3. Creates and submits a hidden form to the Main App
 */
export const submitPreview = async (document: PreviewDocument) => {
  // Build the preview payload
  const payload = {
    dispositif: {
      typeContenu: "dispositif",
      theme: document.metadata?.theme || "63286a015d31b2c0cad99615",
      titreInformatif: document.title,
      origin: "RCO",
      translations: {
        fr: {
          content: {
            markdown: document.editorialContent,
          },
        },
      },
    },
  };

  // Fetch secret and URL in parallel
  const [secretResult, previewUrl] = await Promise.all([
    getPreviewSecret(),
    getPreviewUrl(),
  ]);

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
