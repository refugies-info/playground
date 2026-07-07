export interface ReasoningStep {
  id?: string;
  timestamp: string;
  message: string;
  type: "thinking" | "function_call" | "response";
}

export interface LettaUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface LettaMetadata {
  agentId: string;
  processedAt: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  model?: string;
}

/**
 * Structured error information from Letta API errors.
 * Captures LLM API errors (e.g., llm_api_error) with details for debugging.
 */
export interface LettaApiErrorInfo {
  type: "api_error";
  status?: number;
  message: string;
  details?: unknown;
}

/**
 * Result of any Letta agent report generation.
 * - `complete`: Valid frontmatter was parsed and validated successfully
 * - `error`: AI output was malformed (no frontmatter, failed schema validation, or parse crash).
 *   The raw response and validation errors are preserved for debugging.
 * - `incomplete`: Reserved for partial processing (e.g. streaming not finished)
 */
export interface LettaReportResult {
  status: "complete" | "error" | "incomplete";
  /** Processed markdown with enhanced frontmatter (if complete), or empty string (if error) */
  content: string;
  /** Original agent response, always populated for debugging */
  rawResponse?: string;
  /** Parsed and validated metadata from frontmatter (if complete), or error details (if error) */
  metadata: Record<string, unknown>;
}

/**
 * Possible types for Letta reports in the database.
 */
export type LettaReportType = "ingestion" | "editorial" | "metadata";
