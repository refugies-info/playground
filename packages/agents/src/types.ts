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
