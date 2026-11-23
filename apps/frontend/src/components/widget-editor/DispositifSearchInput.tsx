import type { RiDispositifSummary } from "@playground/shared-types";
import { AsyncSearchInput } from "@playground/ui/forms";
import { getDispositifTitle } from "@/lib/widget-form";

interface DispositifSearchInputProps {
  onSearch: (text: string) => Promise<RiDispositifSummary[]>;
  onSelect: (dispositif: RiDispositifSummary) => void;
  "aria-label"?: string;
}

export function DispositifSearchInput({
  onSearch,
  onSelect,
  "aria-label": ariaLabel = "Rechercher une fiche par mot-clé ou ID",
}: DispositifSearchInputProps) {
  return (
    <AsyncSearchInput
      onSearch={onSearch}
      onSelect={onSelect}
      getResultKey={(dispositif) => dispositif.id}
      renderResult={(dispositif) => (
        <>
          <span className="truncate text-sm leading-6 text-(--text-default-grey)">
            {getDispositifTitle(dispositif)}
          </span>
          {dispositif.sponsorName && (
            <span className="truncate text-xs leading-5 text-(--text-disabled-grey)">
              {dispositif.sponsorName}
            </span>
          )}
        </>
      )}
      placeholder="Rechercher une fiche par mot-clé ou ID"
      aria-label={ariaLabel}
    />
  );
}
