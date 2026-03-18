"use client";

import { ErrorCard } from "@playground/ui/primitives";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";
import { isConnectionError } from "@/lib/errors";

/**
 * Error boundary for the /translations page.
 */
export default function TranslationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: intentional — helps debugging in production
    console.error("[TranslationsError]", error);
  }, [error]);

  const isDbDown = isConnectionError(error);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <ErrorCard
        title={isDbDown ? "Service temporairement indisponible" : "Erreur"}
        icon={isDbDown ? <WifiOff className="size-6" /> : null}
        onRetry={reset}
      >
        <p className="text-sm text-gray-600">
          {isDbDown
            ? process.env.NODE_ENV === "development"
              ? "La base de données ne répond pas. Vérifiez que Supabase est lancé : supabase start"
              : "La base de données ne répond pas. Contactez l'équipe technique."
            : "Impossible de charger les traductions."}
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
              Détails (développement uniquement)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-500">
              {error.message}
              {error.cause ? `\n\nCause: ${String(error.cause)}` : ""}
              {error.digest ? `\n\nDigest: ${error.digest}` : ""}
            </pre>
          </details>
        )}
      </ErrorCard>
    </div>
  );
}
