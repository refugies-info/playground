export interface ReasoningStep {
  id?: string;
  timestamp: string;
  message: string;
  type: "thinking" | "function_call" | "response";
}
