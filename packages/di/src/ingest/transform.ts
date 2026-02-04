import { stringify } from "yaml";

/**
 * Converts a raw DI record into an ingestion record (markdown with frontmatter).
 *
 * @param service - The raw DI service record
 * @param structure - The optional structure record associated with the service
 * @returns The ingestion record as a markdown string
 */
export function diRecordToIngestionRecord(
  service: Record<string, unknown>,
  structure: Record<string, unknown>,
): string {
  const frontmatterData = { ...service, structure };

  const frontmatter = stringify(frontmatterData).trim();

  let markdownBody = "";

  // Extract title
  if (typeof service.nom === "string") {
    markdownBody += `# ${service.nom}\n\n`;
  }

  // Extract presentation_resume
  if (
    typeof service.presentation_resume === "string" &&
    service.presentation_resume.trim()
  ) {
    markdownBody += `${service.presentation_resume.trim()}\n\n`;
  }

  // Extract presentation_detail
  if (
    typeof service.presentation_detail === "string" &&
    service.presentation_detail.trim()
  ) {
    markdownBody += `${service.presentation_detail.trim()}\n\n`;
  }

  return `---\n${frontmatter}\n---\n\n${markdownBody.trim()}`;
}
