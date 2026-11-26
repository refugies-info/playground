import type { RiDispositifSummary } from "@playground/shared-types";
import { RiBuildingLine } from "@playground/ui/icons";
import { Tag } from "@playground/ui/primitives";
import { getDispositifTitle } from "@/lib/widget-form";

interface DispositifTagProps {
  dispositif: RiDispositifSummary;
  onRemove: () => void;
  className?: string;
}

export function DispositifTag({
  dispositif,
  onRemove,
  className,
}: DispositifTagProps) {
  const title = getDispositifTitle(dispositif);
  return (
    <Tag
      status="selected"
      className={className}
      detail={dispositif.sponsorName}
      detailIcon={RiBuildingLine}
      dismissLabel={`Retirer ${title}`}
      onDismiss={onRemove}
    >
      {title}
    </Tag>
  );
}
