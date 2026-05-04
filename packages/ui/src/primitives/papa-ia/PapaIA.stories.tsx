import type { Meta, StoryObj } from "@storybook/react";
import { PapaIA } from "./PapaIA";

const meta: Meta<typeof PapaIA> = {
  component: PapaIA,
  title: "Primitives/PapaIA",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** État repos — déclenche la génération IA. */
export const Default: Story = {
  args: {
    variant: "default",
  },
};

/** Génération en cours — l'icône stop indique qu'on peut annuler. */
export const Loading: Story = {
  args: {
    variant: "loading",
  },
};

/** Bouton désactivé. */
export const Disabled: Story = {
  args: {
    variant: "default",
    disabled: true,
  },
};

/** Comparaison des 2 variantes. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-8 bg-[#f5f5fe] rounded-xl">
      <div className="flex flex-col items-center gap-2">
        <PapaIA variant="default" />
        <span className="text-xs text-gray-500">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PapaIA variant="loading" />
        <span className="text-xs text-gray-500">loading</span>
      </div>
    </div>
  ),
};
