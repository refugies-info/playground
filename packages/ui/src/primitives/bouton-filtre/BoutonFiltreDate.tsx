"use client";

import { RiCalendar2Line, RiCloseCircleFill } from "@remixicon/react";
import * as React from "react";
import { cn } from "../../utils";
import { Icon } from "../icon/Icon";
import { triggerVariants } from "./variants";

/**
 * BoutonFiltreDate — Input date stylisé comme un BoutonFiltre (pill).
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1264-7549
 *
 * - Inactif : bouton qui appelle inputRef.showPicker() au clic
 * - Actif   : bouton qui clear la valeur au clic
 */

export interface BoutonFiltreDateProps {
  /** Label / placeholder affiché quand aucune date n'est sélectionnée */
  label?: string;
  /** Valeur ISO date (YYYY-MM-DD) ou vide */
  value: string;
  /** Callback quand la date change */
  onChange: (value: string) => void;
  /** Classes CSS additionnelles */
  className?: string;
}

function BoutonFiltreDate({
  label = "jj/mm/aaaa",
  value,
  onChange,
  className,
}: BoutonFiltreDateProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hasValue = value !== "";

  const displayValue = hasValue
    ? new Date(value).toLocaleDateString("fr-FR")
    : label;

  const handleClick = () => {
    if (hasValue) {
      onChange("");
    } else {
      inputRef.current?.showPicker();
    }
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className={cn(triggerVariants({ active: hasValue }), className)}
        onClick={handleClick}
        aria-label={hasValue ? "Effacer la date" : label}
      >
        {displayValue}
        <span
          className={cn("flex self-stretch items-center", !hasValue && "pt-1")}
        >
          {hasValue ? (
            <Icon icon={RiCloseCircleFill} size="sm" />
          ) : (
            <Icon icon={RiCalendar2Line} size="sm" />
          )}
        </span>
      </button>

      {/* Input natif ancré sous le bouton pour que showPicker() sache où s'ouvrir */}
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden
        className="absolute bottom-0 left-0 h-0 w-0 opacity-0 pointer-events-none"
      />
    </div>
  );
}

export { BoutonFiltreDate };
