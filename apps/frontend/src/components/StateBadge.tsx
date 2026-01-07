import { Badge } from "@playground/ui/primitives";
import { getStateLabel, getStateVariant } from "@/lib/document-labels";

interface StateBadgeProps {
  state: string;
  className?: string;
}

/**
 * Composant réutilisable pour afficher un badge d'état
 * Utilise automatiquement les traductions et variantes centralisées
 */
export function StateBadge({ state, className }: StateBadgeProps) {
  return (
    <Badge variant={getStateVariant(state)} className={className}>
      {getStateLabel(state)}
    </Badge>
  );
}
