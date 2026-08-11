import { BoutonNotification } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * BoutonNotification — Bouton d'ouverture du panneau de notifications.
 *
 * Les 6 aperçus de la maquette sont le croisement de deux propriétés : le fond
 * (repos / survol / ouvert) et la présence de la pastille de non-lues. Le survol
 * n'étant pas une prop, il se vérifie à la souris sur les stories ci-dessous.
 */
const meta: Meta<typeof BoutonNotification> = {
  title: "Primitives/BoutonNotification",
  component: BoutonNotification,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Repos, aucune notification — survoler pour voir la cloche foncer. */
export const SansNotification: Story = {
  args: { unreadCount: 0 },
};

/** Repos avec des non-lues : la pastille orange apparaît. */
export const AvecNotification: Story = {
  args: { unreadCount: 3 },
};

/** Panneau ouvert, des non-lues restantes. */
export const OuvertAvecNotification: Story = {
  args: { unreadCount: 3, open: true },
};

/**
 * Panneau ouvert et tout est lu : la pastille disparaît, mais le fond « ouvert »
 * subsiste tant que le panneau l'est.
 */
export const OuvertSansNotification: Story = {
  args: { unreadCount: 0, open: true },
};

/** Une seule non-lue — vérifie l'accord de l'énoncé accessible. */
export const UneSeuleNonLue: Story = {
  args: { unreadCount: 1 },
};
