import { cva } from "class-variance-authority";

/**
 * Variantes visuelles partagées par BoutonFiltre et BoutonFiltreDate.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1308-4566
 *
 * 4 états (Figma component set 1308:4566) :
 *   - Actif=off, Survol=off → bg white (#FFF), texte default-grey (#3A3A3A), border default-grey (#DDD)
 *   - Actif=off, Survol=on  → bg alt-grey (#F6F6F6), texte default-grey, border default-grey
 *   - Actif=on,  Survol=off → bg active-blue-france (#000091), texte inverted (#F5F5FE)
 *   - Actif=on,  Survol=on  → bg blue-france-hover (#1212FF), texte inverted (#F5F5FE)
 *
 * Layout (Figma) : padding 6px 10px 6px 12px | gap 4px | border-radius 28px (pill)
 */
export const triggerVariants = cva(
  "inline-flex items-center gap-1 rounded-full pt-[6px] pr-[10px] pb-[6px] pl-3 text-sm font-medium leading-6 cursor-pointer transition-colors border",
  {
    variants: {
      active: {
        true: [
          "bg-[var(--background-active-blue-france,#000091)]",
          "border-[var(--background-active-blue-france,#000091)]",
          "text-[var(--text-inverted-blue-france,#F5F5FE)]",
          "hover:bg-[var(--blue-france-sun-113-625-hover,#1212FF)]",
          "hover:border-[var(--blue-france-sun-113-625-hover,#1212FF)]",
        ].join(" "),
        false: [
          "bg-[var(--background-default-grey,#FFFFFF)]",
          "border-[var(--border-default-grey,#DDDDDD)]",
          "text-[var(--text-default-grey,#3A3A3A)]",
          "hover:bg-[var(--background-alt-grey,#F6F6F6)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);
