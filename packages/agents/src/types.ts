export interface ReasoningStep {
  id?: string;
  timestamp: string;
  message: string;
  type: "thinking" | "function_call" | "response";
}

export interface LettaMetadata {
  agent_id: string;
  processed_at: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
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
 * - `incomplete`: Parsing failed or metadata didn't match schema, raw response preserved
 */
export interface LettaReportResult {
  status: "complete" | "incomplete";
  /** Processed markdown with enhanced frontmatter (if complete), or empty string (if incomplete) */
  content: string;
  /** Original agent response (only populated when status is incomplete) */
  rawResponse?: string;
  /** Parsed and validated metadata from frontmatter (if complete), or minimal letta metadata (if incomplete) */
  metadata: Record<string, unknown>;
}

/**
 * Possible types for Letta reports in the database.
 */
export type LettaReportType = "ingestion" | "editorial" | "metadata";
