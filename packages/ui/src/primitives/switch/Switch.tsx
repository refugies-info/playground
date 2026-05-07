"use client";

import { RiCheckLine } from "../../icons";
import { cn } from "../../utils";

/**
 * Switch — Interrupteur DSFR (Thème clair / Interrupteur, node 534:56)
 *
 * @figma https://www.figma.com/design/FJtP8Ygsr0cIWGAm1QI9Dh/DSFR---Composants---v1.11.0---RI?node-id=534-56
 *
 * Structure exacte (40×24px) :
 *   - Track (Fond) : 40×24, border-radius 40px
 *   - Puce (Thumb) : 24×24, circle — se déplace de x=0 → x=16 au check (translate-x-4)
 *   - Icône check-line : 16×16 centrée dans la puce (inset-1), visible uniquement si coché
 *
 * Couleurs par état (tokens DSFR) :
 *   unchecked enabled  → track: blanc + border #000091 | puce: blanc + border #000091
 *   checked   enabled  → track: #000091 + border #000091 | puce: blanc + border #000091
 *   unchecked disabled → track: blanc + border #E5E5E5  | puce: blanc + border #E5E5E5
 *   checked   disabled → track: #E5E5E5 + border none   | puce: blanc + border #E5E5E5
 */

// ---------------------------------------------------------------------------
// Icônes statiques — hoistées hors du composant
// ---------------------------------------------------------------------------

const ICON_CHECK_ENABLED = (
  <RiCheckLine className="w-4 h-4 text-[var(--text-active-blue-france,#000091)]" />
);
const ICON_CHECK_DISABLED = (
  <RiCheckLine className="w-4 h-4 text-[var(--text-disabled-grey,#929292)]" />
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function Switch({
  checked,
  onChange,
  disabled = false,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SwitchProps) {
  return (
    <label
      className={cn(
        "relative inline-flex items-center",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      {/* Input accessible (sr-only) — "peer" pour le ring de focus */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className="peer sr-only"
      />

      {/*
       * Track (Fond) — 40×24px
       *
       * On utilise box-shadow inset au lieu de border : le GPU anti-alise
       * les courbes en vectoriel → rendu lisse (vs border en software = pixels durs).
       *
       * États → shadow inset change de couleur, background change pour checked.
       */}
      <div
        className={cn(
          "relative h-6 w-10 rounded-full transition-[background-color,box-shadow] duration-200",
          // Focus visible accessible (via peer)
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
          "peer-focus-visible:outline-[var(--border-action-high-blue-france,#000091)]",
          // États
          !disabled &&
            !checked &&
            "bg-white shadow-[inset_0_0_0_1px_var(--border-action-high-blue-france,#000091)]",
          !disabled &&
            checked &&
            "bg-[var(--background-active-blue-france,#000091)]",
          disabled &&
            !checked &&
            "bg-white shadow-[inset_0_0_0_1px_var(--border-disabled-grey,#E5E5E5)]",
          disabled && checked && "bg-[var(--background-disabled-grey,#E5E5E5)]",
        )}
      >
        {/*
         * Puce (Thumb) — 24×24px
         *
         * Même principe : shadow inset à la place de border pour un rendu GPU lisse.
         * Position à top-0 left-0 : le track n'a plus de border dans le box model
         * (on utilise box-shadow inset), donc le track fait exactement h-6 (24px).
         * Pas besoin du -1px de compensation → la puce ne déborde plus du track.
         *
         * Checked : translate-x-4 (16px) → bord droit = 16+24 = 40px = bord droit du track ✅
         */}
        <div
          className={cn(
            "absolute top-0 left-0 h-6 w-6 rounded-full bg-white will-change-transform",
            "transition-transform duration-200",
            checked && "translate-x-4",
            !disabled
              ? "shadow-[inset_0_0_0_1px_var(--border-action-high-blue-france,#000091)]"
              : "shadow-[inset_0_0_0_1px_var(--border-disabled-grey,#E5E5E5)]",
          )}
        >
          {/* Icône check-line — 16×16, centrée dans la puce (inset-1 = 4px padding) */}
          {checked && (
            <div className="absolute inset-1 flex items-center justify-center">
              {!disabled ? ICON_CHECK_ENABLED : ICON_CHECK_DISABLED}
            </div>
          )}
        </div>
      </div>
    </label>
  );
}

Switch.displayName = "Switch";
