import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../primitives/button/Button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * Popover — Overlay générique basé sur Radix UI.
 *
 * **Look fixe** : border bleue `--border-default-blue-france`, shadow sm,
 * fond blanc, radius 2px, `p-6` par défaut.
 *
 * Surcharger via `className` si besoin (`p-2`, `p-0`…).
 * Positionnement via `align` et `side`.
 */
const meta: Meta<typeof PopoverContent> = {
  title: "Overlays/Popover",
  component: PopoverContent,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    align: {
      control: "inline-radio",
      options: ["start", "center", "end"],
      description: "Alignement horizontal par rapport au trigger",
      table: { defaultValue: { summary: "center" } },
    },
    side: {
      control: "inline-radio",
      options: ["top", "bottom", "left", "right"],
      description: "Côté d'apparition",
      table: { defaultValue: { summary: "bottom" } },
    },
    sideOffset: {
      control: { type: "range", min: 0, max: 32, step: 2 },
      description: "Distance (px) entre le trigger et le popover",
      table: { defaultValue: { summary: "8" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind pour surcharger padding, largeur, layout",
    },
    // Masquer les props internes Radix peu utiles dans le panel
    asChild: { table: { disable: true } },
    forceMount: { table: { disable: true } },
    onOpenAutoFocus: { table: { disable: true } },
    onCloseAutoFocus: { table: { disable: true } },
    onEscapeKeyDown: { table: { disable: true } },
    onPointerDownOutside: { table: { disable: true } },
    onFocusOutside: { table: { disable: true } },
    onInteractOutside: { table: { disable: true } },
    hideWhenDetached: { table: { disable: true } },
    avoidCollisions: { table: { disable: true } },
    collisionBoundary: { table: { disable: true } },
    collisionPadding: { table: { disable: true } },
    arrowPadding: { table: { disable: true } },
    sticky: { table: { disable: true } },
    updatePositionStrategy: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Story interactive — utiliser les controls pour tester `align`, `side`, `sideOffset` */
export const Default: Story = {
  args: {
    align: "center",
    side: "bottom",
    sideOffset: 8,
    className: "w-64",
  },
  render: ({ align, side, sideOffset, className }) => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button>Ouvrir</Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={className}
      >
        <p className="text-sm text-[var(--text-default-grey,#3a3a3a)]">
          Contenu du popover.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * Confirmation — pattern dialogue de confirmation.
 * Deux blocs texte (gap-4), boutons Annuler + Confirmer.
 */
export const Confirmation: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="quatrieme" size="sm">
          Action irréversible
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[388px] flex flex-col gap-7">
        <div className="flex flex-col gap-4 text-base text-[var(--text-default-grey,#3a3a3a)]">
          <p>Êtes-vous sûr de vouloir effectuer cette action ?</p>
          <p>
            Cette opération est irréversible et écrasera les données existantes.
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="tertiaire" size="sm">
            Annuler
          </Button>
          <Button variant="primaire" size="sm">
            Confirmer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
