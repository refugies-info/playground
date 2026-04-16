import { PapaIA, type PapaIAVariant } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

const FIGMA_URL =
  "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1365-14766";

/**
 * Bouton flottant d'accès à l'assistant IA (PapaIA).
 *
 * 3 variantes :
 * - **default** — fond bleu, icône IA → déclenche l'assistant
 * - **loading** — fond gris, icône stop → annule la génération
 * - **emoji**   — fond violet, emoji → identité de l'agent
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1365-14766
 */
const meta = {
  title: "Primitives/PapaIA",
  component: PapaIA,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  tags: ["autodocs"],
  args: {
    variant: "default",
    emoji: "🥭",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "loading", "emoji"] satisfies PapaIAVariant[],
    },
    emoji: {
      control: "text",
      if: { arg: "variant", eq: "emoji" },
    },
  },
} satisfies Meta<typeof PapaIA>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────────────────────────
// Variants individuels
// ─────────────────────────────────────────────────────────────────────────────

/** État repos — l'assistant est disponible */
export const Default: Story = {
  name: "Default — assistant disponible",
  args: { variant: "default" },
};

/** Génération en cours — cliquer pour annuler */
export const Loading: Story = {
  name: "Loading — génération en cours",
  args: { variant: "loading" },
};

/** Identité de l'agent avec emoji */
export const Emoji: Story = {
  name: "Emoji — identité agent",
  args: { variant: "emoji", emoji: "🥭" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tous les états
// ─────────────────────────────────────────────────────────────────────────────

export const TousLesEtats: Story = {
  name: "Tous les états",
  render: () => (
    <div className="flex items-center gap-4">
      <PapaIA variant="default" />
      <PapaIA variant="loading" />
      <PapaIA variant="emoji" emoji="🥭" />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Tableau de référence
// ─────────────────────────────────────────────────────────────────────────────

const ALL_VARIANTS: {
  variant: PapaIAVariant;
  label: string;
  description: string;
}[] = [
  { variant: "default", label: "Default", description: "Assistant disponible" },
  { variant: "loading", label: "Loading", description: "Génération en cours" },
  { variant: "emoji", label: "Emoji", description: "Identité de l'agent" },
];

export const Reference: Story = {
  name: "Référence — tous les états",
  render: () => (
    <table className="border-collapse text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b">
          <th className="pb-2 pr-8 font-medium">État</th>
          <th className="pb-2 pr-8 font-medium">Composant</th>
          <th className="pb-2 font-medium">Prop</th>
        </tr>
      </thead>
      <tbody>
        {ALL_VARIANTS.map(({ variant, label, description }) => (
          <tr key={variant} className="border-b border-gray-100">
            <td className="py-3 pr-8 text-gray-600">{description}</td>
            <td className="py-3 pr-8">
              <PapaIA variant={variant} emoji="🥭" />
            </td>
            <td className="py-3 font-mono text-xs text-gray-400">
              variant="{label.toLowerCase()}"
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
