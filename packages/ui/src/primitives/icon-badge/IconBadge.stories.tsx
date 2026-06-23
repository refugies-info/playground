import {
  BADGE_ERROR,
  BADGE_GREY,
  BADGE_INFO,
  BADGE_SUCCESS,
  IconBadge,
} from "@playground/ui";
import {
  RiAuctionLine,
  RiGlobalLine,
  RiPencilLine,
  RiTranslate2,
  RiUserLine,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Pastille ronde contenant une icône, colorée selon les tokens DSFR.
 *
 * Couleurs disponibles : `BADGE_GREY` (défaut), `BADGE_INFO`, `BADGE_SUCCESS`,
 * `BADGE_ERROR`. Utilisée notamment par le journal d'activités.
 */
const meta: Meta<typeof IconBadge> = {
  title: "Primitives/IconBadge",
  component: IconBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    icon: RiPencilLine,
    title: "Note",
  },
};

export default meta;
type Story = StoryObj<typeof IconBadge>;

export const Grey: Story = {
  args: { icon: RiPencilLine, colors: BADGE_GREY, title: "Note" },
};

export const Info: Story = {
  args: { icon: RiGlobalLine, colors: BADGE_INFO, title: "Mise à jour" },
};

export const Success: Story = {
  args: { icon: RiGlobalLine, colors: BADGE_SUCCESS, title: "Publication" },
};

export const Err: Story = {
  args: { icon: RiGlobalLine, colors: BADGE_ERROR, title: "Archivage" },
};

export const ToutesLesCouleurs: Story = {
  name: "Toutes les couleurs",
  render: () => (
    <div className="flex items-center gap-3">
      <IconBadge icon={RiUserLine} colors={BADGE_GREY} title="Assignation" />
      <IconBadge icon={RiAuctionLine} colors={BADGE_GREY} title="Conformité" />
      <IconBadge icon={RiTranslate2} colors={BADGE_GREY} title="Traduction" />
      <IconBadge icon={RiGlobalLine} colors={BADGE_INFO} title="Mise à jour" />
      <IconBadge
        icon={RiGlobalLine}
        colors={BADGE_SUCCESS}
        title="Publication"
      />
      <IconBadge icon={RiGlobalLine} colors={BADGE_ERROR} title="Archivage" />
    </div>
  ),
};
