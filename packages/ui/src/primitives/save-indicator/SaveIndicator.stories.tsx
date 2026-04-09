import {
  SAVE_INDICATOR_LABELS,
  SaveIndicator,
  type SaveStatus,
} from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1361-7769";

/**
 * Indication de l'état de sauvegarde d'un document dans la barre d'outils.
 *
 * 3 variantes : enregistré (check vert), non enregistré (point orange),
 * échec d'enregistrement (point rouge).
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1361-7769
 */
const meta = {
  title: "Primitives/SaveIndicator",
  component: SaveIndicator,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  tags: ["autodocs"],
  args: {
    status: "saved",
  },
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["saved", "saving", "unsaved", "error"] satisfies SaveStatus[],
    },
  },
} satisfies Meta<typeof SaveIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────────────────────────
// Tous les états
// ─────────────────────────────────────────────────────────────────────────────

export const TousLesEtats: Story = {
  name: "Tous les états",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <SaveIndicator status="saved" />
      <SaveIndicator status="saving" />
      <SaveIndicator status="unsaved" />
      <SaveIndicator status="error" />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Variants individuels
// ─────────────────────────────────────────────────────────────────────────────

/** Document sauvegardé — check vert */
export const Saved: Story = {
  name: "Enregistré",
  args: { status: "saved" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Enregistré")).toBeInTheDocument();
  },
};

/** Enregistrement en cours — point bleu pulsant */
export const Saving: Story = {
  name: "Enregistrement en cours",
  args: { status: "saving" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Enregistrement\u2026")).toBeInTheDocument();
  },
};

/** Modifications non enregistrées — point orange */
export const Unsaved: Story = {
  name: "Non enregistré",
  args: { status: "unsaved" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Non enregistré")).toBeInTheDocument();
  },
};

/** Échec de sauvegarde — point rouge */
export const SaveError: Story = {
  name: "Échec d'enregistrement",
  args: { status: "error" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Échec d'enregistrement"),
    ).toBeInTheDocument();
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tableau de référence
// ─────────────────────────────────────────────────────────────────────────────

const ALL_STATUSES: SaveStatus[] = ["saved", "saving", "unsaved", "error"];

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
        {ALL_STATUSES.map((status) => (
          <tr key={status} className="border-b border-gray-100">
            <td className="py-2 pr-8 text-gray-600">
              {SAVE_INDICATOR_LABELS[status]}
            </td>
            <td className="py-2 pr-8">
              <SaveIndicator status={status} />
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
