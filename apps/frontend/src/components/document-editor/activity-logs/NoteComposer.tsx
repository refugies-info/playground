"use client";

import {
  FrErrorFill,
  RiCloseLine,
  RiSendPlaneLine,
} from "@playground/ui/icons";
import { Button } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { publishNoteAction } from "@/services/note-actions";

interface NoteComposerProps {
  workflowId: string;
}

/**
 * Composeur de note du journal d'activités.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1788-7239
 */
export function NoteComposer({ workflowId }: NoteComposerProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setNote("");
    setHasError(false);
  };

  const publish = () => {
    startTransition(async () => {
      const result = await publishNoteAction(workflowId, note);
      if (result.success) {
        reset();
        // Re-fetch the server-rendered logs so the new note appears.
        router.refresh();
      } else {
        setHasError(true);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-end gap-4 rounded-t border border-(--border-default-grey) bg-white p-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Laisser une note..."
          rows={1}
          disabled={isPending}
          className="w-full resize-none field-sizing-content fr-text--md text-(--text-default-grey) placeholder:text-(--text-mention-grey) outline-none disabled:text-(--text-disabled-grey)"
        />
        <div className="flex items-center gap-4">
          <Button
            variant="tertiaire"
            size="sm"
            rightIcon={RiCloseLine}
            onClick={reset}
            disabled={isPending || (!note && !hasError)}
          >
            Annuler
          </Button>
          <Button
            variant="primaire"
            size="sm"
            rightIcon={RiSendPlaneLine}
            onClick={publish}
            isLoading={isPending}
            disabled={!note.trim()}
          >
            Publier
          </Button>
        </div>
      </div>
      {hasError && (
        <p className="flex items-start gap-1 fr-text--xs text-(--text-default-error)">
          <FrErrorFill size={16} />
          La note n'a pas été publiée, veuillez réessayer.
        </p>
      )}
    </div>
  );
}
