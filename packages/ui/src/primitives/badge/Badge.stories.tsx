import { Badge } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * @deprecated Voué à disparaître une fois les nouvelles maquettes intégrées.
 *
 * Étiquette générique à 5 variants sémantiques (neutral, danger, info, success, warning).
 *
 * Pour les états système hors workflow. Statuts de publication → Tag.
 * Résultats d'arbitrage → Conformite.
 */
const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs", "deprecated"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  args: { variant: "neutral", children: "En cours d'arbitrage" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Erreur de traduction IA" },
};

export const Info: Story = {
  args: { variant: "info", children: "Information" },
};

export const Success: Story = {
  args: { variant: "success", children: "Succès" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "Avertissement" },
};

export const TousLesVariants: Story = {
  name: "Tous les variants",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="neutral">En cours d&apos;arbitrage</Badge>
      <Badge variant="danger">Erreur de traduction IA</Badge>
      <Badge variant="info">Information</Badge>
      <Badge variant="success">Succès</Badge>
      <Badge variant="warning">Avertissement</Badge>
    </div>
  ),
};
