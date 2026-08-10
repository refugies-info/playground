import type { LucideIcon } from "lucide-react";

/**
 * ValueActionButton — Bouton d'action d'une cellule de métadonnée (réinitialiser,
 * vider), affiché au survol dans un encadré en haut à droite de la cellule.
 *
 * Partagé par le tableau des métadonnées FR et celui de la traduction (RI-1379),
 * où seul « vider » est proposé.
 */
export function ValueActionButton({
  icon: Icon,
  onClick,
  title,
  className = "",
}: {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex size-8 cursor-pointer items-center justify-center text-gray-500 transition-colors hover:bg-[var(--background-alt-blue-france)] hover:text-[var(--text-action-high-blue-france)] ${className}`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
