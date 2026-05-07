import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Switch, type SwitchProps } from "./Switch";

/**
 * Switch — Interrupteur DSFR (40×24px).
 *
 * @figma https://www.figma.com/design/FJtP8Ygsr0cIWGAm1QI9Dh/DSFR---Composants---v1.11.0---RI?node-id=534-56&m=dev
 */
const meta: Meta<typeof Switch> = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    checked: false,
    disabled: false,
    "aria-label": "Toggle",
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "État coché / non coché",
    },
    disabled: {
      control: "boolean",
      description: "Désactivé (lecture seule)",
    },
    onChange: {
      action: "onChange",
      description: "Callback appelé au changement d'état",
    },
    "aria-label": {
      control: "text",
      description: "Label accessible (si pas de label visible associé)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Composant helper — synchronise l'état interne avec les args Storybook
// (permet aux Controls de changer la valeur initiale)
// ---------------------------------------------------------------------------

function SwitchDemo(args: SwitchProps) {
  const [checked, setChecked] = useState(args.checked ?? false);

  // Resync quand l'utilisateur change la valeur dans les Controls Storybook
  useEffect(() => {
    setChecked(args.checked ?? false);
  }, [args.checked]);

  return (
    <Switch
      {...args}
      checked={checked}
      onChange={(v) => {
        setChecked(v);
        args.onChange?.(v);
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Story principale — interactive avec Controls
// ---------------------------------------------------------------------------

/**
 * Joue avec les controls `checked` et `disabled` pour voir tous les états.
 */
export const Interactif: Story = {
  render: (args) => <SwitchDemo {...args} />,
};

// ---------------------------------------------------------------------------
// Vue d'ensemble — 4 états en grille
// ---------------------------------------------------------------------------

/**
 * Les 4 états DSFR côte à côte pour comparaison visuelle.
 */
export const TousLesEtats: Story = {
  name: "Tous les états",
  render: () => (
    <div className="grid grid-cols-2 gap-x-12 gap-y-6 items-center text-sm">
      {/* Headers */}
      <span className="text-[var(--text-mention-grey,#666)] font-medium">
        Actif
      </span>
      <span className="text-[var(--text-mention-grey,#666)] font-medium">
        Désactivé
      </span>

      {/* Row 1 — Non coché */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[var(--text-mention-grey,#666)]">
          Non coché
        </span>
        <SwitchDemo
          checked={false}
          disabled={false}
          aria-label="Non coché actif"
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[var(--text-mention-grey,#666)]">
          Non coché
        </span>
        <SwitchDemo checked={false} disabled aria-label="Non coché désactivé" />
      </div>

      {/* Row 2 — Coché */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[var(--text-mention-grey,#666)]">
          Coché
        </span>
        <SwitchDemo checked disabled={false} aria-label="Coché actif" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[var(--text-mention-grey,#666)]">
          Coché
        </span>
        <SwitchDemo checked disabled aria-label="Coché désactivé" />
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ---------------------------------------------------------------------------
// Contexte — usage réel dans PublishPanel
// ---------------------------------------------------------------------------

/**
 * Usage contextuel — label "Urgent" à gauche du switch (layout PublishPanel).
 * Figma : layout_HEY1E4 — row, justify-end, gap: 12px.
 */
export const AvecLabel: Story = {
  name: "Avec label (PublishPanel)",
  render: (args) => (
    <div className="flex items-center justify-end gap-3">
      <span className="text-base text-[var(--text-label-grey,#161616)]">
        Urgent
      </span>
      <SwitchDemo
        {...args}
        aria-label="Marquer les traductions comme urgentes"
      />
    </div>
  ),
};
