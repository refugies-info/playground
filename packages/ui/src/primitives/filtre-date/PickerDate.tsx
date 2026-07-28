"use client";

import * as Popover from "@radix-ui/react-popover";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendar2Line,
  RiCloseCircleFill,
} from "@remixicon/react";
import { fr } from "date-fns/locale";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../utils";
import { Icon } from "../icon/Icon";
import { formatIsoDateFr, parseIsoDate, toIsoDate } from "./dates";

/**
 * PickerDate — Champ date (ou intervalle) ouvrant un calendrier.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=4800-27343
 * @figma intervalle: https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=4800-27651
 *
 * - `mode="single"` : un champ, calendrier 1 mois
 * - `mode="range"`  : deux champs (`jj/mm/aaaa - jj/mm/aaaa`), calendrier 2 mois
 *
 * Les valeurs sont des chaînes ISO `YYYY-MM-DD` (chaîne vide = non renseigné).
 * Contrairement à {@link BoutonFiltreDate}, le calendrier n'est pas celui du
 * navigateur : la sélection d'un intervalle impose un rendu maîtrisé.
 */

export type PickerDateProps = {
  className?: string;
  /**
   * `"segment"` : dernier segment d'un conteneur bordé (cf. {@link FiltreDate}) —
   * le champ abandonne bordure et rayon propres au profit de ceux du conteneur.
   */
  variant?: "default" | "segment";
} & (
  | {
      mode: "single";
      /** Date sélectionnée (ISO `YYYY-MM-DD`, vide = aucune) */
      value: string;
      onChange: (value: string) => void;
    }
  | {
      mode: "range";
      /** Borne basse (ISO `YYYY-MM-DD`, vide = aucune) */
      from: string;
      /** Borne haute (ISO `YYYY-MM-DD`, vide = aucune) */
      to: string;
      onChange: (range: { from: string; to: string }) => void;
    }
);

const PLACEHOLDER = "jj/mm/aaaa";

// react-day-picker est utilisé sans sa feuille de style : tout le rendu passe
// par ces classes (cf. Figma 4800:27343 / 4800:27651).
const dayPickerClassNames = {
  months: "flex gap-8",
  month: "flex flex-col gap-4",
  // La nav occupe la ligne des titres : flèche précédente à gauche, suivante à
  // droite, titres de mois centrés entre les deux.
  nav: "absolute inset-x-0 top-0 flex items-center justify-between pointer-events-none",
  button_previous:
    "pointer-events-auto flex items-center justify-center rounded-sm p-1 cursor-pointer text-(--text-active-blue-france) hover:bg-(--background-alt-grey) disabled:opacity-40 disabled:pointer-events-none",
  button_next:
    "pointer-events-auto flex items-center justify-center rounded-sm p-1 cursor-pointer text-(--text-active-blue-france) hover:bg-(--background-alt-grey) disabled:opacity-40 disabled:pointer-events-none",
  month_caption: "flex h-6 items-center justify-center",
  caption_label: "text-base font-bold capitalize text-(--text-title-grey)",
  weekday:
    "w-9 pb-1 text-center text-xs font-normal lowercase text-(--text-mention-grey)",
  day: "p-0 text-center",
  day_button:
    "w-9 h-9 rounded-sm text-sm font-medium cursor-pointer text-(--text-default-grey) hover:bg-(--background-alt-grey)",
  today: "font-bold",
  outside: "text-(--text-disabled-grey)",
  disabled: "opacity-40 pointer-events-none",
  hidden: "invisible",
};

// Bornes sélectionnées : aplat bleu France plein.
const SELECTED_DAY_CLASS =
  "[&>button]:bg-(--background-active-blue-france) [&>button]:text-(--text-inverted-blue-france) [&>button:hover]:bg-(--blue-france-sun-113-625-hover)";
// Intérieur de l'intervalle : aplat bleu clair, texte foncé, coins joints.
// react-day-picker marque ces jours à la fois `selected` et `range_middle` : les
// deux classes visent `[&>button]` à spécificité égale, d'où le `!` qui impose
// l'intérieur — sans lui, le texte inversé de la borne rendrait les chiffres
// illisibles sur l'aplat clair.
const RANGE_MIDDLE_DAY_CLASS = [
  "[&>button]:bg-(--background-alt-blue-france)!",
  "[&>button]:text-(--text-default-grey)!",
  "[&>button]:rounded-none",
  // Le `!` ci-dessus neutralise aussi le survol de la borne : on le redonne.
  "[&>button:hover]:bg-(--background-alt-blue-france-hover)!",
].join(" ");

// react-day-picker attend des composants de navigation : on y injecte les
// icônes Remix pour rester sur la même famille que le reste du design system.
const navComponents = {
  PreviousMonthButton: (props: React.ComponentProps<"button">) => (
    <button type="button" {...props}>
      <Icon icon={RiArrowLeftSLine} size="sm" />
    </button>
  ),
  NextMonthButton: (props: React.ComponentProps<"button">) => (
    <button type="button" {...props}>
      <Icon icon={RiArrowRightSLine} size="sm" />
    </button>
  ),
};

function PickerDate(props: PickerDateProps) {
  const { className, variant = "default" } = props;
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState<Date | undefined>(undefined);

  const isRange = props.mode === "range";
  const from = isRange ? props.from : props.value;
  const to = isRange ? props.to : "";
  const hasValue = from !== "" || to !== "";

  // Entre les deux clics, le survol donne un aperçu de l'intervalle qu'il
  // produirait — borne posée comprise du côté fixe, jour survolé compris.
  const previewing =
    isRange && from !== "" && to === "" && hovered !== undefined;
  const isInPreview = (date: Date) => {
    if (!previewing) return false;
    const day = toIsoDate(date);
    const target = toIsoDate(hovered);
    const [lo, hi] = target < from ? [target, from] : [from, target];
    return day >= lo && day <= hi && day !== from;
  };

  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);

  const label = isRange
    ? `${formatIsoDateFr(from) || PLACEHOLDER} - ${formatIsoDateFr(to) || PLACEHOLDER}`
    : formatIsoDateFr(from) || PLACEHOLDER;

  const clear = () => {
    if (props.mode === "range") {
      props.onChange({ from: "", to: "" });
    } else {
      props.onChange("");
    }
  };

  const calendar =
    props.mode === "range" ? (
      <DayPicker
        mode="range"
        numberOfMonths={2}
        locale={fr}
        defaultMonth={fromDate}
        selected={fromDate ? { from: fromDate, to: toDate } : undefined}
        onSelect={(_range, day) => {
          const clicked = toIsoDate(day);
          if (!from || to) {
            props.onChange({ from: clicked, to: "" });
            return;
          }
          props.onChange(
            clicked < from
              ? { from: clicked, to: from }
              : { from, to: clicked },
          );
          setOpen(false);
        }}
        onDayMouseEnter={(date) => setHovered(date)}
        onDayMouseLeave={() => setHovered(undefined)}
        classNames={dayPickerClassNames}
        modifiers={{ preview: isInPreview }}
        modifiersClassNames={{
          selected: SELECTED_DAY_CLASS,
          range_middle: RANGE_MIDDLE_DAY_CLASS,
          // L'aperçu reprend l'aplat de l'intervalle définitif.
          preview: RANGE_MIDDLE_DAY_CLASS,
        }}
        components={navComponents}
      />
    ) : (
      <DayPicker
        mode="single"
        locale={fr}
        defaultMonth={fromDate}
        selected={fromDate}
        onSelect={(date) => {
          props.onChange(toIsoDate(date));
          setOpen(false);
        }}
        classNames={dayPickerClassNames}
        modifiersClassNames={{ selected: SELECTED_DAY_CLASS }}
        components={navComponents}
      />
    );

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Sans ça, l'aperçu du survol précédent réapparaîtrait à la réouverture.
        if (!next) setHovered(undefined);
      }}
    >
      {/* Le popover s'ancre sur tout le champ, pas sur le seul déclencheur. */}
      <Popover.Anchor asChild>
        <div
          className={cn(
            "items-center py-[6px] pr-2 pl-3 transition-colors",
            "bg-(--background-default-grey) hover:bg-(--background-alt-grey)",
            variant === "segment"
              ? "flex self-stretch"
              : "inline-flex rounded-[4px] border border-(--border-default-grey)",
            className,
          )}
        >
          <Popover.Trigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1 text-sm font-medium leading-6 whitespace-nowrap cursor-pointer",
                hasValue
                  ? "text-(--text-default-grey)"
                  : "text-(--text-disabled-grey)",
              )}
            >
              {label}
              {!hasValue && (
                <span className="flex items-center text-(--text-default-grey)">
                  <Icon icon={RiCalendar2Line} size="sm" />
                </span>
              )}
            </button>
          </Popover.Trigger>
          {hasValue && (
            <button
              type="button"
              onClick={clear}
              className="flex items-center pl-1 cursor-pointer text-(--text-disabled-grey) hover:text-(--text-default-grey)"
              aria-label="Effacer la date"
            >
              <Icon icon={RiCloseCircleFill} size="sm" />
            </button>
          )}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-50 rounded-lg border bg-white p-6 shadow-md",
            "border-(--border-default-grey)",
            "animate-in fade-in-0 zoom-in-95",
          )}
        >
          <div className="relative">{calendar}</div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { PickerDate };
