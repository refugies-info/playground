import { IndicationConformite } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Badge compact d'arbitrage — icône seule (pas de texte).
 *
 * Utilisé dans le menu latéral de la fiche à côté de "Arbitrage".
 * Fond coloré + point 8×8px selon l'état de conformité.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1728-9296
 */
const meta: Meta<typeof IndicationConformite> = {
  component: IndicationConformite,
  title: "Primitives/IndicationConformite",
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "inline-radio",
      options: ["conforme", "non-conforme"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Conforme: Story = {
  args: { value: "conforme" },
};

export const NonConforme: Story = {
  args: { value: "non-conforme" },
};

export const LesDeux: Story = {
  name: "Les deux variants",
  render: () => (
    <div className="flex items-center gap-3">
      <IndicationConformite value="conforme" />
      <IndicationConformite value="non-conforme" />
    </div>
  ),
};

/** Taille réelle dans le contexte du menu (inline avec texte) */
export const DansLeBouton: Story = {
  name: "Dans un bouton menu",
  render: () => (
    <div className="flex items-center gap-2 text-sm text-[var(--text-mention-grey)]">
      <span>Arbitrage</span>
      <IndicationConformite value="conforme" />
    </div>
  ),
};
