import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./pagination";

/**
 * Navigation entre pages — style Figma (node 1380:5898).
 *
 * Affiche "X–Y sur Z" avec boutons précédent/suivant icône seule.
 * Container bordé (1px --border-default-grey, radius 2px), boutons CTA Quatrième.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1380-5898
 */
const meta: Meta<typeof Pagination> = {
  title: "Composites/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    currentPage: 1,
    pageSize: 25,
    totalCount: 3288,
    onPageChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Première page — bouton précédent désactivé */
export const PremierePagee: Story = {
  name: "Première page",
  args: { currentPage: 1 },
};

/** Page intermédiaire — les deux boutons actifs */
export const PageIntermediaire: Story = {
  name: "Page intermédiaire",
  args: { currentPage: 66 },
};

/** Dernière page — bouton suivant désactivé */
export const DernierePage: Story = {
  name: "Dernière page",
  args: {
    currentPage: Math.ceil(3288 / 25), // 132
  },
};

/** Aucun résultat — affiche "0 résultat", les deux boutons désactivés */
export const SansResultat: Story = {
  name: "Sans résultat",
  args: { currentPage: 1, totalCount: 0 },
};

/** Interactif — naviguer entre les pages */
export const Interactif: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    return <Pagination {...args} currentPage={page} onPageChange={setPage} />;
  },
};
