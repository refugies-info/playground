import { Avatar } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Avatar — Représentation visuelle d'un utilisateur ou de l'IA.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=378-4313
 *
 * 2 variants :
 * - **Utilisateur** : initiales sur fond bleu lavande (#E3E3FD), texte bleu marine (#000091)
 * - **IA** : icône robot sur fond gris (#EEEEEE)
 */
const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Utilisateur avec email — initiales dérivées de la partie locale */
export const Utilisateur: Story = {
  args: {
    email: "alice@refugies.info",
  },
};

/** 4 initiales différentes — dérivées de la partie locale de l'email */
export const UtilisateurInitiales: Story = {
  name: "Utilisateur — initiales variées",
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar email="alice@refugies.info" />
      <Avatar email="claudia@refugies.info" />
      <Avatar email="xavier@refugies.info" />
      <Avatar email="bo@refugies.info" />
    </div>
  ),
};

/** Variant IA — fond gris, icône robot */
export const IA: Story = {
  args: {
    isAI: true,
  },
};

/** isAI forcé même si un email est fourni */
export const IAAvecEmail: Story = {
  name: "IA (forcé via isAI)",
  args: {
    email: "bot@refugies.info",
    isAI: true,
  },
};

/** Absence d'email → fallback IA automatique */
export const SansEmail: Story = {
  name: "Sans email → IA automatique",
  args: {
    email: null,
  },
};

/** Les deux variants côte à côte comme dans la colonne Auteur du tableau */
export const ColonneAuteur: Story = {
  name: "Colonne Auteur — comparaison",
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <Avatar email="alice@refugies.info" />
        <span className="text-xs text-gray-500">Utilisateur</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar isAI />
        <span className="text-xs text-gray-500">IA</span>
      </div>
    </div>
  ),
};
