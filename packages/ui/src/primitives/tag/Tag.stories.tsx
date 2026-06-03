import { TAG_LABELS, Tag, type TagStatus } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1256-5829";

/**
 * Statut workflow d'une fiche : publication et traitement éditorial.
 *
 * Pour les résultats d'arbitrage (conforme/non conforme) → Conformite.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1256-5829
 */
const meta = {
  title: "Primitives/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  tags: ["autodocs"],
  args: {
    status: "a-traiter",
  },
  argTypes: {
    status: {
      control: "inline-radio",
      options: [
        "a-traiter",
        "en-cours",
        "archive",
        "a-revoir",
        "publie",
        "na",
      ] satisfies TagStatus[],
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────────────────────────
// Tous les statuts
// ─────────────────────────────────────────────────────────────────────────────

export const TousLesStatuts: Story = {
  name: "Tous les statuts",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag status="a-traiter" />
      <Tag status="en-cours" />
      <Tag status="archive" />
      <Tag status="a-revoir" />
      <Tag status="publie" />
      <Tag status="na" />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Variants individuels
// ─────────────────────────────────────────────────────────────────────────────

/** Fiche en attente d'action — étape initiale après import */
export const ATraiter: Story = {
  name: "À traiter",
  args: { status: "a-traiter" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("À traiter")).toBeInTheDocument();
  },
};

/** Fiche ouverte par un éditeur */
export const EnCours: Story = {
  name: "En cours",
  args: { status: "en-cours" },
};

/** Fiche retirée de la liste active, conservée en historique */
export const Archive: Story = {
  name: "Archivé",
  args: { status: "archive" },
};

/** Fiche signalée pour relecture */
export const ARevoir: Story = {
  name: "À revoir",
  args: { status: "a-revoir" },
};

/** Fiche visible sur refugies.info */
export const Publie: Story = {
  name: "Publié",
  args: { status: "publie" },
};

/** Aucun statut applicable — affiché comme tiret */
export const NA: Story = {
  name: "NA (vide)",
  args: { status: "na" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tableau de référence
// ─────────────────────────────────────────────────────────────────────────────

const ALL_STATUSES: TagStatus[] = [
  "a-traiter",
  "en-cours",
  "archive",
  "a-revoir",
  "publie",
  "na",
];

export const Reference: Story = {
  name: "Référence — tous les statuts",
  render: () => (
    <table className="border-collapse text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b">
          <th className="pb-2 pr-8 font-medium">Statut</th>
          <th className="pb-2 pr-8 font-medium">Tag</th>
          <th className="pb-2 font-medium">Prop</th>
        </tr>
      </thead>
      <tbody>
        {ALL_STATUSES.map((status) => (
          <tr key={status} className="border-b border-gray-100">
            <td className="py-2 pr-8 text-gray-600">{TAG_LABELS[status]}</td>
            <td className="py-2 pr-8">
              <Tag status={status} />
            </td>
            <td className="py-2 font-mono text-xs text-gray-400">
              status="{status}"
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
