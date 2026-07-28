"use client";

import * as Popover from "@radix-ui/react-popover";
import { RiArrowDownSLine, RiCloseCircleFill } from "@remixicon/react";
import * as React from "react";
import { cn } from "../../utils";
import type { FilterOption } from "../bouton-filtre/BoutonFiltre";
import { FilterOptionsList } from "../bouton-filtre/FilterOptionsList";
import { Icon } from "../icon/Icon";

/**
 * FiltreDateDropdown — Segment single-select du FiltreDate.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=4800-26957
 * @figma actif: https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=4800-26975
 *
 * Contrairement au {@link BoutonFiltre} (pill autonome), ce déclencheur est un
 * segment carré d'un conteneur partagé : ni bordure ni rayon propres, seulement
 * un séparateur à droite. Le popover, lui, est celui des autres filtres.
 */

export interface FiltreDateDropdownProps {
  /** Libellé affiché tant qu'aucune option n'est sélectionnée */
  label: string;
  options: FilterOption[];
  /** Valeur sélectionnée (chaîne vide = aucune) */
  value: string;
  onChange: (value: string) => void;
  /** Largeur minimale du popover */
  minWidth?: string;
}

function FiltreDateDropdown({
  label,
  options,
  value,
  onChange,
  minWidth = "160px",
}: FiltreDateDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const hasSelection = value !== "";
  const selectedLabel = options.find((o) => o.value === value)?.label;

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "flex items-center self-stretch border-r transition-colors",
          hasSelection
            ? [
                "bg-(--background-active-blue-france)",
                "border-(--background-active-blue-france)",
                "text-(--text-inverted-blue-france)",
                "hover:bg-(--blue-france-sun-113-625-hover)",
                "hover:border-(--blue-france-sun-113-625-hover)",
              ]
            : [
                "border-(--border-default-grey)",
                "text-(--text-default-grey)",
                "hover:bg-(--background-alt-grey)",
              ],
        )}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 self-stretch py-[6px] pl-3 pr-2 text-sm font-medium leading-6 whitespace-nowrap cursor-pointer"
          >
            {selectedLabel ?? label}
            {!hasSelection && <Icon icon={RiArrowDownSLine} size="sm" />}
          </button>
        </Popover.Trigger>
        {/* Actif : la croix efface la sélection sans ouvrir le popover. */}
        {hasSelection && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center self-stretch pl-1 pr-2 cursor-pointer"
            aria-label={`Effacer le filtre ${label.toLowerCase()}`}
          >
            <Icon icon={RiCloseCircleFill} size="sm" />
          </button>
        )}
      </div>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          style={{ minWidth }}
          className={cn(
            "z-50 rounded-lg border bg-white p-2 shadow-md",
            "border-(--border-default-grey)",
            "animate-in fade-in-0 zoom-in-95",
          )}
        >
          <FilterOptionsList
            options={options}
            value={value}
            onSelect={select}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { FiltreDateDropdown };
