import type { RiDispositifSummary } from "@playground/shared-types";
import { AsyncSearchInput } from "@playground/ui/forms";
import { Button } from "@playground/ui/primitives";
import { getDispositifTitle } from "@/lib/widget-form";
import { WidgetEditorSection } from "./WidgetEditorSection";

const TYPE_LABELS: Record<RiDispositifSummary["type"], string> = {
  dispositif: "Dispositif",
  demarche: "Démarche",
};

const describe = ({ sponsorName, type, status }: RiDispositifSummary) =>
  [sponsorName, TYPE_LABELS[type], status].filter(Boolean).join(" · ");

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
          <div className="flex items-start justify-between gap-4 rounded-t-[4px] border-b-2 border-(--border-plain-grey) bg-(--background-contrast-grey) px-4 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-6 text-(--text-title-grey)">
                {getDispositifTitle(selected)}
              </p>
              <p className="text-xs leading-5 text-(--text-mention-grey)">
                {describe(selected)}
              </p>
            </div>
            <Button
              type="button"
              variant="tertiaire"
              size="sm"
              onClick={() => onSelect(null)}
            >
              Changer de fiche
            </Button>
          </div>
        ) : (
          <AsyncSearchInput
            onSearch={onSearch}
            onSelect={onSelect}
            getResultKey={(dispositif) => dispositif.id}
            renderResult={(dispositif) => (
              <>
                <span className="text-sm font-medium leading-6 text-(--text-title-grey)">
                  {getDispositifTitle(dispositif)}
                </span>
                <span className="text-xs leading-5 text-(--text-mention-grey)">
                  {describe(dispositif)}
                </span>
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
