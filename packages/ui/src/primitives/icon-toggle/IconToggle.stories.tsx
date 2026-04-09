import { IconToggle, type IconToggleOption } from "@playground/ui";
import {
  RiCodeSSlashLine,
  RiGridLine,
  RiListUnordered,
  RiPencilLine,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1415-7010";

/**
 * Toggle de boutons icônes mutuellement exclusifs.
 *
 * Utilisé par exemple pour basculer entre l'éditeur visuel et le mode markdown brut.
 * Accepte N options avec chacune une icône Remix.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1415-7010
 */
const meta = {
  title: "Primitives/IconToggle",
  component: IconToggle,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof IconToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────────────────────────
// Editor mode toggle (2 options)
// ─────────────────────────────────────────────────────────────────────────────

const EDITOR_OPTIONS: IconToggleOption[] = [
  { value: "visual", icon: RiPencilLine, label: "Éditeur visuel" },
  { value: "raw", icon: RiCodeSSlashLine, label: "Markdown brut" },
];

function EditorModeDemo() {
  const [mode, setMode] = useState("visual");
  return (
    <div className="flex flex-col items-center gap-4">
      <IconToggle options={EDITOR_OPTIONS} value={mode} onChange={setMode} />
      <span className="text-sm text-gray-500">
        Mode actif : <strong>{mode}</strong>
      </span>
    </div>
  );
}

/** Bascule éditeur visuel / markdown brut */
export const EditorMode: Story = {
  name: "Mode éditeur (2 options)",
  render: () => <EditorModeDemo />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radiogroup")).toBeInTheDocument();
    await expect(canvas.getAllByRole("radio")).toHaveLength(2);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// View mode toggle (3 options)
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_OPTIONS: IconToggleOption[] = [
  { value: "list", icon: RiListUnordered, label: "Vue liste" },
  { value: "grid", icon: RiGridLine, label: "Vue grille" },
  { value: "code", icon: RiCodeSSlashLine, label: "Vue code" },
];

function ViewModeDemo() {
  const [view, setView] = useState("list");
  return (
    <div className="flex flex-col items-center gap-4">
      <IconToggle options={VIEW_OPTIONS} value={view} onChange={setView} />
      <span className="text-sm text-gray-500">
        Vue active : <strong>{view}</strong>
      </span>
    </div>
  );
}

/** Exemple avec 3 options pour montrer la flexibilité */
export const ViewMode: Story = {
  name: "Mode vue (3 options)",
  render: () => <ViewModeDemo />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("radio")).toHaveLength(3);
  },
};
