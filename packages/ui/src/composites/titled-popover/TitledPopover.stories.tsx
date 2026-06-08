import type { Meta, StoryObj } from "@storybook/react";
import { TitledPopover } from "./TitledPopover";

const meta: Meta<typeof TitledPopover> = {
  title: "Composites/TitledPopover",
  component: TitledPopover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1513-6639",
    },
  },
  args: {
    title: "Assigner à…",
    trigger: (
      <button
        type="button"
        className="flex items-center gap-1 rounded px-3 py-1.5 bg-white border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
      >
        Ouvrir
      </button>
    ),
    children: (
      <div className="flex flex-col gap-1 px-2 pb-1">
        {["Camille ", "Julie P", "Jérémy P"].map((name) => (
          <button
            type="button"
            key={name}
            className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm w-full hover:bg-gray-100 transition-colors"
          >
            {name}
          </button>
        ))}
      </div>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Mode click (défaut) — s'ouvre au clic */
export const ClickMode: Story = {
  args: { openOn: "click" },
};

/** Mode hover — s'ouvre au survol avec délai anti-flicker */
export const HoverMode: Story = {
  args: { openOn: "hover" },
};

/** Titre personnalisé */
export const CustomTitle: Story = {
  args: {
    title: "Publié en…",
    openOn: "click",
  },
};

/** Alignement à droite */
export const AlignEnd: Story = {
  args: {
    align: "end",
    openOn: "click",
  },
};

/** Contenu riche — avec avatar et checkmark */
export const RichContent: Story = {
  args: {
    title: "Assigner à…",
    openOn: "click",
    children: (
      <div className="flex flex-col gap-1 px-2 pb-1">
        {[
          { name: "Camille", checked: true },
          { name: "Julie P", checked: false },
          { name: "Jérémy P", checked: false },
        ].map(({ name, checked }) => (
          <button
            type={"button"}
            key={name}
            className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm w-full hover:bg-gray-100 transition-colors"
          >
            <span>{name}</span>
            {checked && <span className="text-blue-600">✓</span>}
          </button>
        ))}
      </div>
    ),
  },
};
