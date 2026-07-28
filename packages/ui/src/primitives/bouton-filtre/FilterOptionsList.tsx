"use client";

import { cn } from "../../utils";
import type { FilterOption } from "./BoutonFiltre";

/**
 * Liste d'options d'un filtre single-select, à placer dans un Popover.Content.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1264-7616
 *
 * Le popover est identique quelle que soit la forme du déclencheur (pill du
 * BoutonFiltre ou segment carré du FiltreDate) : « c'est le même composant que
 * pour les dropdown des autres filtres » (RI-1371).
 */

export interface FilterOptionsListProps {
  options: FilterOption[];
  /** Valeur sélectionnée (chaîne vide = aucune) */
  value: string;
  /** Reçoit "" quand « Aucun » est choisi */
  onSelect: (value: string) => void;
  /** Libellé de l'option de remise à zéro */
  emptyLabel?: string;
}

const optionClass = cn(
  "block w-full text-left text-sm font-medium leading-6 px-2 py-1 rounded-sm",
  "text-(--text-default-grey)",
  "hover:bg-(--background-alt-grey)",
);

function FilterOptionsList({
  options,
  value,
  onSelect,
  emptyLabel = "Aucun",
}: FilterOptionsListProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => onSelect("")}
        className={cn(optionClass, value === "" && "font-bold")}
      >
        {emptyLabel}
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className={cn(optionClass, value === option.value && "font-bold")}
        >
          {option.label}
        </button>
      ))}
    </>
  );
}

export { FilterOptionsList };
