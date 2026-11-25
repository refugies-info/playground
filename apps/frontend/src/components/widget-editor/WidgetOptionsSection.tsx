"use client";

import type { WidgetConfigPageSize } from "@playground/shared-types";
import { CheckboxField, SelectInput, SwitchField } from "@playground/ui/forms";
import {
  FILTER_BAR_CRITERIA,
  isFilterBarOptionFixed,
  type ListFormValues,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/widget-form";
import { WidgetEditorSection } from "./WidgetEditorSection";

type OptionsValues = Pick<
  ListFormValues,
  | "pageSize"
  | "displayShareModule"
  | "displayFilterBar"
  | "filterBarOptions"
  | "sortBy"
  | "filters"
>;

interface WidgetOptionsSectionProps {
  values: OptionsValues;
  onChange: (changes: Partial<OptionsValues>) => void;
}

export function WidgetOptionsSection({
  values,
  onChange,
}: WidgetOptionsSectionProps) {
  const toggleFilterBarOption = (
    option: (typeof FILTER_BAR_CRITERIA)[number]["option"],
    checked: boolean,
  ) =>
    onChange({
      filterBarOptions: checked
        ? [...values.filterBarOptions, option]
        : values.filterBarOptions.filter((current) => current !== option),
    });

  return (
    <WidgetEditorSection
      title="Options et apparence"
      description="Personnalisation et options du widget."
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="widget-page-size">
            Nombre de fiches par page
          </label>
          <SelectInput
            id="widget-page-size"
            value={String(values.pageSize)}
            options={PAGE_SIZE_OPTIONS.map((size) => ({
              value: String(size),
              label: String(size),
            }))}
            onChange={(size) =>
              onChange({ pageSize: Number(size) as WidgetConfigPageSize })
            }
          />
        </div>

        <div className="flex flex-col gap-4">
          <SwitchField
            label="Afficher la barre de filtres"
            className="flex-row-reverse justify-between"
            checked={values.displayFilterBar}
            onChange={(displayFilterBar) => onChange({ displayFilterBar })}
          />
          {values.displayFilterBar && (
            <div className="flex flex-col pl-4">
              {FILTER_BAR_CRITERIA.map(({ option, label }) => {
                const isFixed = isFilterBarOptionFixed(option, values.filters);
                return (
                  <CheckboxField
                    key={option}
                    label={label}
                    checked={
                      !isFixed && values.filterBarOptions.includes(option)
                    }
                    disabled={isFixed}
                    hint={
                      isFixed
                        ? "Indisponible : ce critère est déjà fixé dans la section Contenu du widget."
                        : undefined
                    }
                    onChange={(checked) =>
                      toggleFilterBarOption(option, checked)
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="widget-sort-by">
            Trier par
          </label>
          <SelectInput
            id="widget-sort-by"
            value={values.sortBy}
            options={SORT_OPTIONS}
            onChange={(sortBy) =>
              onChange({ sortBy: sortBy as ListFormValues["sortBy"] })
            }
          />
        </div>
      </div>
    </WidgetEditorSection>
  );
}
