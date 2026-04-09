import * as React from "react";
import { useMemo } from "react";
import { cn } from "../../utils";
import { Icon, type IconRef } from "../icon";

/**
 * IconToggle — Groupe de boutons icônes mutuellement exclusifs.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1415-7010
 *
 * Composant générique : accepte N options, chacune avec une icône Remix.
 * L'option active a un fond blanc, une bordure grise et une ombre légère.
 * Les options inactives sont sur fond transparent.
 *
 * Usage :
 *   <IconToggle
 *     options={[
 *       { value: "visual", icon: RiPencilLine, label: "Éditeur visuel" },
 *       { value: "raw", icon: RiCodeSSlashLine, label: "Markdown brut" },
 *     ]}
 *     value="visual"
 *     onChange={(v) => setMode(v)}
 *   />
 */

export interface IconToggleOption<T extends string = string> {
  /** Valeur unique identifiant l'option */
  value: T;
  /** Icône Remix Icons */
  icon: IconRef;
  /** Label accessible (aria-label du bouton) */
  label: string;
}

export interface IconToggleProps<T extends string = string> {
  /** Options disponibles */
  options: IconToggleOption<T>[];
  /** Valeur actuellement sélectionnée */
  value: T;
  /** Callback au changement de sélection */
  onChange: (value: T) => void;
  /** Classe CSS additionnelle sur le conteneur */
  className?: string;
}

function IconToggleInner<T extends string>(
  { options, value, onChange, className }: IconToggleProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const activeIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value],
  );

  return (
    <div
      ref={ref}
      role="radiogroup"
      className={cn(
        "relative inline-flex items-center rounded-xs bg-[var(--background-alt-grey)] p-0.5",
        className,
      )}
    >
      {/* Sliding indicator */}
      {activeIndex >= 0 && (
        <span
          aria-hidden="true"
          className="absolute size-8 rounded-xs bg-[var(--background-default-grey)] border border-[var(--border-default-grey)] shadow-sm transition-transform duration-200 ease-in-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
      )}

      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center size-8 rounded-xs transition-colors cursor-pointer",
              "text-[var(--text-default-grey)]",
              "hover:text-[var(--text-title-grey)]",
            )}
          >
            <Icon icon={option.icon} size="sm" />
          </button>
        );
      })}
    </div>
  );
}

/**
 * forwardRef avec generics — on cast le résultat pour préserver le type T.
 * @see https://fettblog.eu/typescript-react-generic-forward-refs/
 */
export const IconToggle = React.forwardRef(IconToggleInner) as <
  T extends string = string,
>(
  props: IconToggleProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
