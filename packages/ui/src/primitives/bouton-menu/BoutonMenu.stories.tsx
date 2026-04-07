import { BoutonMenu } from "@playground/ui";
import {
  RiAccountCircleLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiTranslate2,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Élément de navigation de l'AppHeader — icône + label, état actif/inactif.
 *
 * Utilisé exclusivement dans AppHeader via un élément <nav>.
 */
const meta: Meta<typeof BoutonMenu> = {
  component: BoutonMenu,
  title: "Primitives/BoutonMenu",
  tags: ["autodocs"],
  argTypes: {
    active: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** État inactif — fond transparent, icône + label gris */
export const Defaut: Story = {
  args: {
    icon: RiFileTextLine,
    label: "Fiches",
    active: false,
  },
};

/** État actif — fond bleu France, barre de soulignement */
export const Actif: Story = {
  args: {
    icon: RiFileTextLine,
    label: "Fiches",
    active: true,
  },
};

export const Traduction: Story = {
  args: {
    icon: RiTranslate2,
    label: "Espace de traduction",
    active: false,
  },
};

export const Utilisateurs: Story = {
  args: {
    icon: RiAccountCircleLine,
    label: "Utilisateurs",
    active: false,
  },
};

export const Deconnexion: Story = {
  args: {
    icon: RiLogoutBoxRLine,
    label: "Se déconnecter",
    active: false,
  },
};

/** Tous les boutons alignés comme dans le header */
export const Navigation: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <BoutonMenu icon={RiFileTextLine} label="Importer" />
      <BoutonMenu icon={RiFileTextLine} label="Fiches" active />
      <BoutonMenu icon={RiTranslate2} label="Espace de traduction" />
      <BoutonMenu icon={RiAccountCircleLine} label="Utilisateurs" />
      <BoutonMenu icon={RiLogoutBoxRLine} label="Se déconnecter" />
    </div>
  ),
};
