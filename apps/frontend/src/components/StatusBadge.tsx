import { Badge } from "@playground/ui/primitives";
import { getStatusLabel, getStatusVariant } from "@/lib/document-labels";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Composant réutilisable pour afficher un badge de statut
 * Utilise automatiquement les traductions et variantes centralisées
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
}
