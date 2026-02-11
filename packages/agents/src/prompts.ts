/**
 * Slash commands understood by the Letta agent for processing different phases.
 * All commands expect markdown input with frontmatter and produce markdown output.
 */
export const AUDIT_SLASH_COMMAND = "/audit";
export const REDACTION_SLASH_COMMAND = "/redaction";
export const METADATA_SLASH_COMMAND = "/metadata";
export const TRANSLATE_SLASH_COMMAND = "/translate";

/**
 * @deprecated Use AUDIT_SLASH_COMMAND instead
 */
export const INGESTION_AGENT_HEADING =
  "Analyse conformité + doublons (parallèle):";
