import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../primitives/button/Button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * Popover — Overlay générique basé sur Radix UI.
 *
 * Le primitif est intentionnellement non-opinioné : pas de shadow ni de
 * border par défaut. Les styles métier sont passés via `className` sur
 * `PopoverContent` par le consommateur (ex : PublishPanel).
 */
const meta: Meta<typeof PopoverContent> = {
  title: "Overlays/Popover",
  component: PopoverContent,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Popover basique avec contenu texte */
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Ouvrir</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 rounded bg-white p-4 shadow-md border border-[var(--border-default-grey,#DDDDDD)]">
        <p className="text-sm text-gray-700">Contenu du popover.</p>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * Popover avec style PublishPanel — reproduit le Figma (node 1824-25605) :
 *   border #dddddd (--border-default-grey), pas de shadow,
 *   border-radius 4px, padding 24px, width 368px.
 */
export const StylePublishPanel: Story = {
  name: "Style PublishPanel (Figma)",
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="primaire">Publier</Button>
      </PopoverTrigger>
      <PopoverContent
        variant="panel"
        align="end"
        sideOffset={8}
        className="flex flex-col gap-6"
      >
        <p className="text-sm text-[#3a3a3a]">
          Êtes-vous sûr de vouloir publier cette fiche ? Elle sera visible par
          tous les utilisateurs de Réfugiés.info.
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="tertiaire" size="sm">
            Annuler
          </Button>
          <Button variant="primaire" size="sm">
            Publier
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/** Popover aligné à gauche du trigger */
export const AlignStart: Story = {
  name: "Align start",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondaire">Options</Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-48 rounded bg-white p-3 border border-[var(--border-default-grey,#DDDDDD)] shadow-md"
      >
        <ul className="text-sm space-y-2 text-gray-700">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </PopoverContent>
    </Popover>
  ),
};
