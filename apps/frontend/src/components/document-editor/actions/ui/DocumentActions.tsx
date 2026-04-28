"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDocument } from "../../DocumentContext";
import { useDocumentActions } from "../DocumentActionsContext";

interface DocumentActionsProps {
  isCollapsed?: boolean;
}

/**
 * DocumentActions — Actions restantes dans la sidebar.
 *
 * Preview, Save et Publish ont été migrés vers HeaderFicheConnected (slot right).
 * DocumentActions ne gère plus que l'Archive.
 */
export function DocumentActions({ isCollapsed = false }: DocumentActionsProps) {
  const router = useRouter();
  const { document } = useDocument();
  const { archiveDocument, isArchiving } = useDocumentActions();

  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleArchive = async () => {
    setArchiveError(null);
    setArchiveSuccess(false);

    if (document?.publicationRemoteId) {
      if (
        !confirm(
          "Êtes-vous sûr de vouloir archiver ce document ? Il ne sera plus visible publiquement.",
        )
      ) {
        return;
      }
    }

    const result = await archiveDocument();

    if (!isMounted.current) return;

    if (result.success) {
      setArchiveSuccess(true);
      router.refresh();
      setTimeout(() => isMounted.current && setArchiveSuccess(false), 3000);
    } else {
      setArchiveError(result.error || "Échec de l'archivage");
    }
  };

  // Archive uniquement si non archivé
  if (document?.onlineStatus === "archived") return null;

  return (
    <div className="flex flex-col gap-2 p-4 border-t bg-white">
      {(archiveSuccess || archiveError) && (
        <div className="text-xs text-center mb-1">
          {archiveSuccess && <span className="text-green-600">Archivé ✓</span>}
          {archiveError && <span className="text-red-600">{archiveError}</span>}
        </div>
      )}

      <Button
        variant="tertiaire"
        size="sm"
        onClick={handleArchive}
        disabled={isArchiving}
        className={cn(
          "gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700",
          isCollapsed && "justify-center px-0",
        )}
      >
        <Archive className="w-4 h-4" />
        {!isCollapsed && (isArchiving ? "Archivage..." : "Archiver")}
      </Button>
    </div>
  );
}
