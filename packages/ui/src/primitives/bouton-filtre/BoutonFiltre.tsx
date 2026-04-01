"use client";

import * as Popover from "@radix-ui/react-popover";
import { RiArrowDownSLine, RiCloseCircleFill } from "@remixicon/react";
import * as React from "react";
import { cn } from "../../utils";
import { Icon } from "../icon/Icon";
import { triggerVariants } from "./variants";

/**
 * BoutonFiltre — Bouton toggle qui ouvre un Popover Radix avec une liste d'options.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1308-4566
 * @figma popover: https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1264-7616
 *
 * - Inactif : chevron + ouvre le popover au clic
 * - Actif   : croix + clear direct au clic (pas de popover)
 */

export interface FilterOption {
  label: string;
  value: string;
}

export interface BoutonFiltreProps {
  /** Label affiché quand aucune option n'est sélectionnée */
  label: string;
  /** Options disponibles dans le popover */
  options: FilterOption[];
  /** Valeur sélectionnée (string vide = aucune) */
  value: string;
  /** Callback quand la valeur change */
  onChange: (value: string) => void;
  /** Classes CSS additionnelles */
  className?: string;
}

function BoutonFiltre({
  label,
  options,
  value,
  onChange,
  className,
}: BoutonFiltreProps) {
  const [open, setOpen] = React.useState(false);
  const hasSelection = value !== "";

  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Quand actif : clic = clear direct, pas de popover
  const triggerButton = (
    <button
      type="button"
      className={cn(triggerVariants({ active: hasSelection }), className)}
      onClick={hasSelection ? () => onChange("") : undefined}
    >
      {selectedLabel ?? label}
      {/* Figma: frame icône avec pt-1 pour l'alignement arrow-s-down */}
      <span
        className={cn(
          "flex self-stretch items-center",
          !hasSelection && "pt-1",
        )}
      >
        {hasSelection ? (
          <Icon icon={RiCloseCircleFill} size="sm" />
        ) : (
          <Icon icon={RiArrowDownSLine} size="sm" />
        )}
      </span>
    </button>
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {hasSelection ? (
        triggerButton
      ) : (
        <Popover.Trigger asChild>{triggerButton}</Popover.Trigger>
      )}
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-50 w-[124px] rounded-lg border bg-white py-2 px-6 shadow-md",
            "border-[var(--border-default-grey,#DDDDDD)]",
            "animate-in fade-in-0 zoom-in-95",
          )}
        >
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={cn(
              "block w-full text-left text-sm font-medium leading-6 py-0.5",
              "text-[var(--text-default-grey,#3A3A3A)]",
              "hover:text-[var(--text-title-grey,#161616)]",
              value === "" && "font-bold",
            )}
          >
            Aucun
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "block w-full text-left text-sm font-medium leading-6 py-0.5",
                "text-[var(--text-default-grey,#3A3A3A)]",
                "hover:text-[var(--text-title-grey,#161616)]",
                value === option.value && "font-bold",
              )}
            >
              {option.label}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { BoutonFiltre };
