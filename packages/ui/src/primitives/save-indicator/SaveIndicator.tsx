import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../utils";

/**
 * SaveIndicator — Indication de l'état de sauvegarde d'un document.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1361-7769
 *
 * 3 variantes issues du Figma (component set "Indication sauvegarde") :
 *
 *   saved    → Rond vert (#18753C) + "Enregistré"
 *   saving   → Rond bleu (#000091) + "Enregistrement…"
 *   unsaved  → Rond orange (#FA794A) + "Non enregistré"
 *   error    → Rond rouge (#CE0500) + "Échec d'enregistrement"
 *
 * Style commun : fond blanc, bordure 1px #DDD, radius 4px, texte 12px medium #666.
 */

const saveIndicatorVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-xs px-1.5 py-0.5 border text-xs font-medium select-none whitespace-nowrap bg-[var(--background-default-grey)] border-[var(--border-default-grey)] text-[var(--text-mention-grey)]",
);

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

const LABELS: Record<SaveStatus, string> = {
  saved: "Enregistré",
  saving: "Enregistrement\u2026",
  unsaved: "Non enregistré",
  error: "Échec d'enregistrement",
};

/**
 * Signal coloré (petit cercle 8px) pour les états unsaved/error.
 * Pour saved on utilise RiCheckboxCircleFill.
 */
function SignalDot({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
    />
  );
}

export interface SaveIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof saveIndicatorVariants> {
  /** État de sauvegarde du document */
  status: SaveStatus;
}

const SaveIndicator = React.forwardRef<HTMLDivElement, SaveIndicatorProps>(
  ({ className, status, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(saveIndicatorVariants(), className)}
        {...props}
      >
        {status === "saved" ? (
          <SignalDot color="var(--text-default-success)" />
        ) : status === "saving" ? (
          <SignalDot
            color="var(--text-action-high-blue-france)"
            className="animate-pulse"
          />
        ) : status === "unsaved" ? (
          <SignalDot color="var(--orange-terre-battue-main-645)" />
        ) : (
          <SignalDot color="var(--background-flat-error)" />
        )}
        <span>{LABELS[status]}</span>
      </div>
    );
  },
);
SaveIndicator.displayName = "SaveIndicator";

export { SaveIndicator, LABELS as SAVE_INDICATOR_LABELS };
