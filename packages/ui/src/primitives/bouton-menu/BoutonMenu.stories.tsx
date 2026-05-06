import { BoutonMenu } from "@playground/ui";
import {
  RiAccountCircleLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiTranslate2,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Élément de navigation de l'AppHeader et de la Sidebar — icône + label, état actif/inactif.
 *
 * Utilisé dans :
 * - AppHeader (nav horizontale) — avec label
 * - Sidebar (nav verticale repliée) — iconOnly=true
 */
const meta: Meta<typeof BoutonMenu> = {
  component: BoutonMenu,
  title: "Primitives/BoutonMenu",
  tags: ["autodocs"],
  argTypes: {
    active: { control: "boolean" },
    iconOnly: { control: "boolean" },
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

/** Mode icône seule — sidebar repliée. Le label est masqué, visible en tooltip au survol. */
export const IconOnly: Story = {
  name: "Icon only (sidebar repliée)",
  args: {
    icon: RiFileTextLine,
    label: "Fiches",
    iconOnly: true,
    active: false,
  },
};

/** Icon only actif */
export const IconOnlyActif: Story = {
  name: "Icon only actif",
  args: {
    icon: RiFileTextLine,
    label: "Fiches",
    iconOnly: true,
    active: true,
  },
};

/** Variant error — utilisé pour les actions destructrices comme "Archiver". */
export const ErrorVariant: Story = {
  args: {
    icon: RiLogoutBoxRLine,
    label: "Archiver",
    variant: "error",
  },
};

/** Comparaison : sidebar déployée vs repliée */
export const SidebarDeployeeVsRepliee: Story = {
  name: "Sidebar — déployée vs repliée",
  render: () => (
    <div className="flex gap-8 items-start">
      {/* Sidebar déployée */}
      <div className="flex flex-col gap-2 w-48">
        <p className="text-xs text-gray-400 mb-1">Déployée</p>
        <BoutonMenu icon={RiFileTextLine} label="Fiches" active />
        <BoutonMenu icon={RiTranslate2} label="Espace de traduction" />
        <BoutonMenu icon={RiAccountCircleLine} label="Utilisateurs" />
      </div>
      {/* Sidebar repliée */}
      <div className="flex flex-col gap-2 w-10">
        <p className="text-xs text-gray-400 mb-1">Repliée</p>
        <BoutonMenu icon={RiFileTextLine} label="Fiches" iconOnly active />
        <BoutonMenu icon={RiTranslate2} label="Espace de traduction" iconOnly />
        <BoutonMenu icon={RiAccountCircleLine} label="Utilisateurs" iconOnly />
      </div>
    </div>
  ),
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
