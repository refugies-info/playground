"use client";

import { useRef } from "react";
import { useDocument } from "../DocumentContext";

/**
 * Hook partagé pour déclencher / annuler l'amélioration IA.
 * Utilisé par PapaIAFab (DocumentLayout) et AssistantPanel.
 */
export function useAssistant() {
  const { document, setAiSuggestion, isProcessing, setIsProcessing } =
    useDocument();
  const abortControllerRef = useRef<AbortController | null>(null);

  const improve = async () => {
    if (!document?.editorialContent) return;

    abortControllerRef.current = new AbortController();
    setIsProcessing(true);

    try {
      const response = await fetch("/api/agents/editorial/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flowId: document.id,
          content: document.editorialContent,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      let finalContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.message_type === "assistant_message" && parsed.content) {
              finalContent = parsed.content;
            }
          } catch {
            // ignore parse errors on stream chunks
          }
        }
      }

      if (finalContent) setAiSuggestion(finalContent);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const cancel = () => {
    // 1. Coupe le stream SSE côté client immédiatement
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    abortControllerRef.current = null;

    // 2. Kill les runs Letta côté serveur (fire & forget)
    if (document?.id) {
      fetch("/api/agents/editorial/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowId: document.id }),
      }).catch(() => {
        // Erreur non bloquante — le stream est déjà coupé côté client
      });
    }
  };

  const toggle = () => {
    if (isProcessing) cancel();
    else improve();
  };

  return { improve, cancel, toggle, isProcessing };
}
