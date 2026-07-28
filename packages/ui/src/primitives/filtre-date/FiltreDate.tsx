"use client";

import { cn } from "../../utils";
import type { FilterOption } from "../bouton-filtre/BoutonFiltre";
import { FiltreDateDropdown } from "./FiltreDateDropdown";
import { PickerDate } from "./PickerDate";

/**
 * FiltreDate — Filtre de date composite : type de date + condition + pickerdate.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=4800-27044
 *
 * Les trois éléments forment un seul bloc bordé à coins droits (comme le
 * SearchInput voisin), segmenté par des séparateurs verticaux — et non trois
 * pills indépendantes comme les autres filtres.
 *
 * Les deux dropdowns sont facultatifs : sans sélection, le consommateur
 * applique ses valeurs par défaut (cf. `DEFAULT_DATE_FILTER_*`). La condition
 * pilote le nombre de champs date — `rangeCondition` en affiche deux.
 *
 * Changer la condition réinitialise les dates saisies (RI-1371) ; changer le
 * type de date les conserve, seul le champ filtré change.
 */

export interface FiltreDateValue {
  /** Type de date filtré ("" = aucun, le défaut du consommateur s'applique) */
  type: string;
  /** Condition ("" = aucune, le défaut du consommateur s'applique) */
  condition: string;
  /** Borne basse / date unique en condition "à partir de" (ISO `YYYY-MM-DD`) */
  from: string;
  /** Borne haute / date unique en condition "jusqu'à" (ISO `YYYY-MM-DD`) */
  to: string;
}

export interface FiltreDateProps {
  value: FiltreDateValue;
  /** Reçoit la valeur complète : les 4 champs bougent souvent ensemble. */
  onChange: (value: FiltreDateValue) => void;
  /** Options du dropdown "Type de date" */
  typeOptions: FilterOption[];
  /** Options du dropdown "Condition" */
  conditionOptions: FilterOption[];
  /** Condition appliquée tant qu'aucune n'est sélectionnée */
  defaultCondition: string;
  /** Condition affichant deux champs date */
  rangeCondition: string;
  /** Conditions dont la date unique est une borne haute (sinon borne basse) */
  upperBoundConditions: string[];
  /** Libellé du dropdown "Type de date" à l'état initial */
  typeLabel?: string;
  /** Libellé du dropdown "Condition" à l'état initial */
  conditionLabel?: string;
  className?: string;
}

function FiltreDate({
  value,
  onChange,
  typeOptions,
  conditionOptions,
  defaultCondition,
  rangeCondition,
  upperBoundConditions,
  typeLabel = "Type de date",
  conditionLabel = "Condition",
  className,
}: FiltreDateProps) {
  const effectiveCondition = value.condition || defaultCondition;
  const isRange = effectiveCondition === rangeCondition;
  // En condition simple, la date unique est stockée dans la borne qu'elle
  // représente : "jusqu'à" alimente `to`, "à partir de" alimente `from`.
  const isUpperBound = upperBoundConditions.includes(effectiveCondition);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[4px] border overflow-hidden",
        "border-(--border-default-grey) bg-(--background-default-grey)",
        className,
      )}
    >
      <FiltreDateDropdown
        label={typeLabel}
        options={typeOptions}
        value={value.type}
        onChange={(type) => onChange({ ...value, type })}
      />

      <FiltreDateDropdown
        label={conditionLabel}
        options={conditionOptions}
        value={value.condition}
        // Le nombre de champs change : les dates saisies sont réinitialisées.
        onChange={(condition) =>
          onChange({ ...value, condition, from: "", to: "" })
        }
      />

      {isRange ? (
        <PickerDate
          variant="segment"
          mode="range"
          from={value.from}
          to={value.to}
          onChange={({ from, to }) => onChange({ ...value, from, to })}
        />
      ) : (
        <PickerDate
          variant="segment"
          mode="single"
          value={isUpperBound ? value.to : value.from}
          onChange={(date) =>
            onChange({
              ...value,
              from: isUpperBound ? "" : date,
              to: isUpperBound ? date : "",
            })
          }
        />
      )}
    </div>
  );
}

export { FiltreDate };
