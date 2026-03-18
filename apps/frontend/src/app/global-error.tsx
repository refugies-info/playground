"use client";

import { useEffect } from "react";
import { isConnectionError } from "@/lib/errors";

/**
 * Global error boundary for the root layout.
 *
 * This is the last resort — it catches errors thrown by the root layout itself.
 * It must render its own <html> and <body> since the root layout won't be available.
 *
 * Note: cannot use ErrorCard here because Tailwind CSS won't be loaded —
 * styles are inlined directly.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: intentional — helps debugging in production
    console.error("[GlobalError]", error);
  }, [error]);

  const isDbDown = isConnectionError(error);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#f9fafb",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            backgroundColor: "#fff",
            border: "1px solid #fecaca",
            borderRadius: "0.5rem",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }} aria-hidden="true">
              🔴
            </span>
            <h1
              style={{
                margin: 0,
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              {isDbDown
                ? "Service temporairement indisponible"
                : "Une erreur inattendue est survenue"}
            </h1>
          </div>

          <p style={{ margin: 0, fontSize: "0.875rem", color: "#4b5563" }}>
            {isDbDown
              ? process.env.NODE_ENV === "development"
                ? "La base de données ne répond pas. Vérifiez que Supabase est lancé : supabase start"
                : "La base de données ne répond pas. Contactez l'équipe technique."
              : "Quelque chose s'est mal passé. Essayez de recharger la page."}
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              backgroundColor: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>

          {process.env.NODE_ENV === "development" && (
            <details style={{ marginTop: "1rem" }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                }}
              >
                Détails (développement uniquement)
              </summary>
              <pre
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                {error.message}
                {error.cause ? `\n\nCause: ${String(error.cause)}` : ""}
                {error.digest ? `\n\nDigest: ${error.digest}` : ""}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
