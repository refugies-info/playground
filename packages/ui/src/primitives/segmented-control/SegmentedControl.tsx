import * as React from "react";
import { cn } from "../../utils";
import type { IconRef } from "../icon";
import { Icon } from "../icon";

/**
 * SegmentedControl — Contrôle segmenté accessible avec indicateur glissant.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1385-11483
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { value: "visual", icon: RiEyeLine, label: "Visuel" },
 *     { value: "raw", icon: RiCodeSSlashLine, label: "Markdown" },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 *   aria-label="Mode d'édition"
 * />
 * ```
 *
 * Accessibilité :
 * - Navigation flèches gauche/droite, Home/End
 * - Rôle radiogroup avec options role=radio
 * - aria-label sur le container et chaque option
 *
 * Avec 2 options : toggle au clic peu importe le bouton.
 * L'indicateur actif glisse via translate CSS (200ms ease-in-out).
 */

interface SegmentedOption<T extends string> {
  value: T;
  icon: IconRef;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const activeIndex = options.findIndex((o) => o.value === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // activeIndex est déjà calculé au render — on le réutilise
    let nextIndex = activeIndex;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = activeIndex - 1;
        break;
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = activeIndex + 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    if (nextIndex >= 0 && nextIndex < options.length) {
      onChange(options[nextIndex].value);
      const buttons = containerRef.current?.querySelectorAll("button");
      buttons?.[nextIndex]?.focus();
    }
  };

  const handleClick = () => {
    // Avec 2 options : toggle peu importe le bouton cliqué
    if (options.length === 2) {
      const other = options.find((o) => o.value !== value);
      if (other) onChange(other.value);
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel ?? "Options"}
      className={cn(
        "relative inline-flex flex-row rounded-xs",
        "border border-[var(--border-default-grey,#dddddd)]",
        "bg-[var(--background-alt-grey,#f6f6f6)]",
        "h-8",
        disabled && "opacity-50",
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Indicateur glissant — fond blanc qui se translate vers l'option active */}
      <div
        className="absolute inset-y-0 transition-transform duration-200 ease-in-out pointer-events-none"
        style={{
          width: `${100 / options.length}%`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      >
        <div className="h-full rounded-xs bg-[var(--background-default-grey,#ffffff)] shadow-[2px_0px_6px_0px_rgba(0,0,18,0.16)]" />
      </div>

      {options.map((option) => {
        const isActive = option.value === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: <button role="radio"> est valide ici — l'élément contient une icône, incompatible avec <input type="radio">
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            disabled={disabled}
            onClick={
              options.length === 2 ? handleClick : () => onChange(option.value)
            }
            className={cn(
              "relative z-10 flex-1 inline-flex items-center justify-center p-2 h-8",
              "transition-colors duration-200",
              isActive
                ? "text-[var(--text-default-grey,#3a3a3a)]"
                : "text-[var(--text-mention-grey,#666666)] hover:text-[var(--text-default-grey,#3a3a3a)]",
            )}
          >
            <Icon icon={option.icon} size="sm" />
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };
export type { SegmentedControlProps, SegmentedOption };
