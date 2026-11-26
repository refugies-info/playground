"use client";

import type { RiDispositifSummary } from "@playground/shared-types";
import {
  AGE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  FRENCH_LEVEL_OPTIONS,
  LANGUAGE_OPTIONS,
  PUBLIC_OPTIONS,
  STATUS_OPTIONS,
  toggleValue,
} from "@/lib/widget-filters";
import type { ListFormValues } from "@/lib/widget-form";
import { DepartmentsField } from "./DepartmentsField";
import { DispositifsField } from "./DispositifsField";
import { FilterChoices } from "./FilterChoices";
import { WidgetEditorSection } from "./WidgetEditorSection";

type ContentValues = Pick<
  ListFormValues,
  "filters" | "selectedDispositifs" | "excludedDispositifs"
>;

interface WidgetContentSectionProps {
  values: ContentValues;
  onChange: (changes: Partial<ContentValues>) => void;
  themes: { value: string; label: string }[];
}

const addDispositif = (
  dispositifs: RiDispositifSummary[],
  dispositif: RiDispositifSummary,
) =>
  dispositifs.some(({ id }) => id === dispositif.id)
    ? dispositifs
    : [...dispositifs, dispositif];

export function WidgetContentSection({
  values,
  onChange,
  themes,
}: WidgetContentSectionProps) {
  const { filters } = values;
  const toggleFilter =
    <Key extends keyof ContentValues["filters"]>(key: Key) =>
    (value: NonNullable<ContentValues["filters"][Key]>[number]) =>
      onChange({
        filters: {
          ...filters,
          [key]: toggleValue(
            filters[key] as readonly (typeof value)[] | undefined,
            value,
          ),
        },
      });

  return (
    <WidgetEditorSection
      title="Choix des fiches"
      description="Choisissez les fiches à afficher sur le widget. Vous pouvez utiliser les filtres, ajouter des fiches une par une, ou faire les deux."
    >
      <div className="flex flex-col gap-6">
        <FilterChoices
          label="Type de fiches"
          options={CONTENT_TYPE_OPTIONS}
          selected={filters.contentTypes ?? []}
          onToggle={toggleFilter("contentTypes")}
        />
        <DepartmentsField
          selected={filters.departments ?? []}
          onAdd={(department) =>
            onChange({
              filters: {
                ...filters,
                departments: [
                  ...new Set([...(filters.departments ?? []), department]),
                ],
              },
            })
          }
          onRemove={(department) =>
            onChange({
              filters: {
                ...filters,
                departments: (filters.departments ?? []).filter(
                  (current) => current !== department,
                ),
              },
            })
          }
        />
        <FilterChoices
          label="Thème"
          options={themes}
          selected={filters.themes ?? []}
          onToggle={toggleFilter("themes")}
        />
        <FilterChoices
          label="Statut"
          options={STATUS_OPTIONS}
          selected={filters.statuses ?? []}
          onToggle={toggleFilter("statuses")}
        />
        <FilterChoices
          label="Public spécifique"
          options={PUBLIC_OPTIONS}
          selected={filters.publics ?? []}
          onToggle={toggleFilter("publics")}
        />
        <FilterChoices
          label="Âge"
          options={AGE_OPTIONS}
          selected={filters.ages ?? []}
          onToggle={toggleFilter("ages")}
        />
        <FilterChoices
          label="Niveau de français"
          options={FRENCH_LEVEL_OPTIONS}
          selected={filters.frenchLevels ?? []}
          onToggle={toggleFilter("frenchLevels")}
        />
        <FilterChoices
          label="Traduit en"
          options={LANGUAGE_OPTIONS}
          selected={filters.languages ?? []}
          onToggle={toggleFilter("languages")}
        />
        <DispositifsField
          label="Forcer l’ajout d’une ou plusieurs fiches"
          description="Si la sélection ne comporte pas les fiches que vous désirez, vous pouvez forcer leur présence."
          dispositifs={values.selectedDispositifs}
          onAdd={(dispositif) =>
            onChange({
              selectedDispositifs: addDispositif(
                values.selectedDispositifs,
                dispositif,
              ),
            })
          }
          onRemove={(dispositif) =>
            onChange({
              selectedDispositifs: values.selectedDispositifs.filter(
                ({ id }) => id !== dispositif.id,
              ),
            })
          }
        />
        <DispositifsField
          label="Forcer l’exclusion d’une ou plusieurs fiches"
          description="Si la sélection comporte des fiches que vous ne désirez pas, vous pouvez forcer leur exclusion."
          dispositifs={values.excludedDispositifs}
          onAdd={(dispositif) =>
            onChange({
              excludedDispositifs: addDispositif(
                values.excludedDispositifs,
                dispositif,
              ),
            })
          }
          onRemove={(dispositif) =>
            onChange({
              excludedDispositifs: values.excludedDispositifs.filter(
                ({ id }) => id !== dispositif.id,
              ),
            })
          }
        />
      </div>
    </WidgetEditorSection>
  );
}
