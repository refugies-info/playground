"use client";

import { Button } from "@playground/ui/primitives";
import { useEffect } from "react";

export default function TranslationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // biome-ignore lint/suspicious/noConsole: Log error to console for debugging
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Une erreur est survenue !
      </h2>
      <p className="text-gray-500">Impossible de charger les traductions.</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Réessayer
      </Button>
    </div>
  );
}
