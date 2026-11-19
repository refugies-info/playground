import type { RiDispositifSummary } from "@playground/shared-types";
import { AsyncSearchInput } from "@playground/ui/forms";
import { RiGovernmentLine } from "@playground/ui/icons";
import { Tag } from "@playground/ui/primitives";
import { getDispositifTitle } from "@/lib/widget-form";
import { WidgetEditorSection } from "./WidgetEditorSection";

interface ThumbnailPickerProps {
  selected: RiDispositifSummary | null;
  onSelect: (dispositif: RiDispositifSummary | null) => void;
  onSearch: (text: string) => Promise<RiDispositifSummary[]>;
  error?: string;
}

export function ThumbnailPicker({
  selected,
  onSelect,
  onSearch,
  error,
}: ThumbnailPickerProps) {
  return (
    <WidgetEditorSection
      title="Choix de la fiche"
      description="Sélection de la fiche affichée dans le widget."
    >
      <div className="flex flex-col gap-2">
        {selected ? (
          <Tag
            status="selected"
            className="self-start"
            detail={selected.sponsorName}
            detailIcon={RiGovernmentLine}
            dismissLabel="Retirer la fiche"
            onDismiss={() => onSelect(null)}
          >
            {getDispositifTitle(selected)}
          </Tag>
        ) : (
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
            aria-label="Rechercher une fiche par mot-clé ou ID"
          />
        )}
        {error && (
          <p
            role="alert"
            className="text-xs leading-5 text-(--text-default-error)"
          >
            {error}
          </p>
        )}
      </div>
    </WidgetEditorSection>
  );
}
