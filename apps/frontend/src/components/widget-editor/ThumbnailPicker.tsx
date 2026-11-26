import type { RiDispositifSummary } from "@playground/shared-types";
import { DispositifSearchInput } from "./DispositifSearchInput";
import { DispositifTag } from "./DispositifTag";
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
          <DispositifTag
            className="self-start"
            dispositif={selected}
            onRemove={() => onSelect(null)}
          />
        ) : (
          <DispositifSearchInput onSearch={onSearch} onSelect={onSelect} />
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
