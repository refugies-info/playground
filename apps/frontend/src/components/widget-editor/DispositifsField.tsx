import type { RiDispositifSummary } from "@playground/shared-types";
import { DispositifSearchInput } from "./DispositifSearchInput";
import { DispositifTag } from "./DispositifTag";
import { searchDispositifs } from "./searchDispositifs";

interface DispositifsFieldProps {
  label: string;
  description: string;
  dispositifs: readonly RiDispositifSummary[];
  onAdd: (dispositif: RiDispositifSummary) => void;
  onRemove: (dispositif: RiDispositifSummary) => void;
}

export function DispositifsField({
  label,
  description,
  dispositifs,
  onAdd,
  onRemove,
}: DispositifsFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-6 text-(--text-default-grey)">
          {label}
        </span>
        <span className="text-xs leading-5 text-(--text-mention-grey)">
          {description}
        </span>
      </div>
      <DispositifSearchInput
        onSearch={searchDispositifs}
        onSelect={onAdd}
        aria-label={`${label} : rechercher une fiche par mot-clé ou ID`}
      />
      {dispositifs.length > 0 && (
        <ul className="flex flex-col items-start gap-2">
          {dispositifs.map((dispositif) => (
            <li key={dispositif.id} className="max-w-full">
              <DispositifTag
                dispositif={dispositif}
                onRemove={() => onRemove(dispositif)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
