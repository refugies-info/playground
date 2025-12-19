"use client";

import type { ReasoningStep } from "@playground/agents";
import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDocument } from "./DocumentContext";

export function EditorChat() {
  const {
    document,
    setAiSuggestion,
    isProcessing,
    setIsProcessing,
    isComparisonMode,
  } = useDocument();
  const [error, setError] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<ReasoningStep[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-collapse when comparison mode is active
  useEffect(() => {
    if (isComparisonMode) {
      setIsCollapsed(true);
    }
  }, [isComparisonMode]);

  const handleImproveContent = async () => {
    if (!document?.editorialContent) {
      setError("No document content to improve");
      return;
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsProcessing(true);
    setError(null);
    setReasoning([]); // Clear previous reasoning

    try {
      const response = await fetch("/api/editorial-agent/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructions:
            "Transforme ce contenu en langage clair. Utilise le bloc compétence_transformation_langage_clair et format_sortie_transformation.",
          content: document.editorialContent,
          flowId: document.id,
          metadata: document.metadata, // Include ingestion_records metadata
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let finalContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              // Handle error messages from the backend
              if (parsed.type === "error") {
                setError(parsed.message);
                continue;
              }

              if (parsed.message_type === "assistant_message") {
                const content =
                  typeof parsed.content === "string"
                    ? parsed.content
                    : JSON.stringify(parsed.content);

                finalContent = content;
                setReasoning((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(36).substring(7),
                    timestamp: parsed.timestamp || new Date().toISOString(),
                    message: content,
                    type: "response",
                  },
                ]);
              } else if (parsed.message_type === "reasoning_message") {
                const content =
                  typeof parsed.reasoning === "string"
                    ? parsed.reasoning
                    : JSON.stringify(parsed.reasoning);

                setReasoning((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(36).substring(7),
                    timestamp: parsed.timestamp || new Date().toISOString(),
                    message: content,
                    type: "thinking",
                  },
                ]);
              } else if (parsed.message_type === "tool_call_message") {
                setReasoning((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(36).substring(7),
                    timestamp: parsed.timestamp || new Date().toISOString(),
                    message: `Calling function: ${
                      parsed.tool_call?.name || "unknown"
                    }`,
                    type: "function_call",
                  },
                ]);
              }
            } catch (error) {
              // biome-ignore lint/suspicious/noConsole: Necessary for debugging stream parsing errors
              console.error("Error parsing stream data:", { error, data });
            }
          }
        }
      }

      // Update document with final content
      if (finalContent) {
        setAiSuggestion(finalContent);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Don't show error if cancelled
      }
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full border-l bg-white transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-12" : "w-80",
      )}
    >
      <div className="flex items-center p-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
          disabled={isComparisonMode}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
        {!isCollapsed && (
          <span className="font-semibold text-sm ml-2">IA Chat</span>
        )}
      </div>

      {/* Reasoning Log */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
              {error}
            </div>
          )}

          {reasoning.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">
                Raisonnement de l'IA
              </h3>
              {reasoning.map((step, index) => (
                <div
                  key={step.id || index}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {step.type === "thinking" && (
                      <Brain className="w-3 h-3 text-purple-600" />
                    )}
                    {step.type === "function_call" && (
                      <Zap className="w-3 h-3 text-blue-600" />
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(step.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {step.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Cliquez sur le bouton ci-dessous pour améliorer votre document
              avec l'IA.
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isCollapsed && (
        <div className="p-4 border-t space-y-2">
          <button
            type="button"
            onClick={handleImproveContent}
            disabled={isProcessing || !document?.editorialContent}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Hourglass className="w-4 h-4 animate-pulse" />
                Je réfléchis...
              </>
            ) : (
              <>
                <WandSparkles className="w-4 h-4" /> Améliorer avec l'IA
              </>
            )}
          </button>

          {isProcessing && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  );
}
