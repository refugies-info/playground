import { SegmentedControl } from "@playground/ui";
import {
  RiCodeSSlashLine,
  RiEyeLine,
  RiLayoutLeftLine,
  RiListCheck3,
  RiSearchLine,
  RiSettingsLine,
} from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

/**
 * Contrôle segmenté accessible — inspiré iOS/Figma.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1385-11486
 */
const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  title: "Primitives/SegmentedControl",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const EDITOR_OPTIONS = [
  { value: "visual" as const, icon: RiEyeLine, label: "Visuel" },
  { value: "raw" as const, icon: RiCodeSSlashLine, label: "Markdown" },
];

export const Defaut: Story = {
  render: () => {
    const [mode, setMode] = useState<"visual" | "raw">("visual");
    return (
      <SegmentedControl
        options={EDITOR_OPTIONS}
        value={mode}
        onChange={setMode}
        aria-label="Mode d'édition"
      />
    );
  },
};

export const RawActif: Story = {
  render: () => {
    const [mode, setMode] = useState<"visual" | "raw">("raw");
    return (
      <SegmentedControl
        options={EDITOR_OPTIONS}
        value={mode}
        onChange={setMode}
        aria-label="Mode d'édition"
      />
    );
  },
};

export const Desactive: Story = {
  render: () => (
    <SegmentedControl
      options={EDITOR_OPTIONS}
      value="visual"
      onChange={() => {}}
      disabled
      aria-label="Mode d'édition (désactivé)"
    />
  ),
};

const FOUR_OPTIONS = [
  { value: "layout" as const, icon: RiLayoutLeftLine, label: "Mise en page" },
  { value: "list" as const, icon: RiListCheck3, label: "Liste" },
  { value: "search" as const, icon: RiSearchLine, label: "Recherche" },
  { value: "settings" as const, icon: RiSettingsLine, label: "Paramètres" },
];

export const QuatreElements: Story = {
  render: () => {
    const [tab, setTab] = useState<"layout" | "list" | "search" | "settings">(
      "layout",
    );
    return (
      <SegmentedControl
        options={FOUR_OPTIONS}
        value={tab}
        onChange={setTab}
        aria-label="Navigation"
      />
    );
  },
};
