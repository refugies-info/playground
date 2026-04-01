import { AppHeader, AppLogo, BoutonMenu } from "@playground/ui";
import {
  RiAccountCircleLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiTranslate2,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof AppHeader> = {
  component: AppHeader,
  title: "Composites/AppHeader",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Logo = () => (
  <AppLogo
    image={<img src="/logo-ri.svg" alt="BOMO" className="h-12 w-12" />}
    title="BOMO ?"
  />
);

/** Header complet admin */
export const Admin: Story = {
  render: () => (
    <AppHeader>
      <Logo />
      <nav className="ml-auto flex items-center gap-2 py-3">
        <BoutonMenu icon={RiFileTextLine} label="Importer" />
        <BoutonMenu icon={RiFileTextLine} label="Fiches" active />
        <BoutonMenu icon={RiTranslate2} label="Espace de traduction" />
        <BoutonMenu icon={RiAccountCircleLine} label="Utilisateurs" />
        <BoutonMenu icon={RiLogoutBoxRLine} label="Se déconnecter" />
      </nav>
    </AppHeader>
  ),
};

/** Header traducteur (seul Se déconnecter visible) */
export const Traducteur: Story = {
  render: () => (
    <AppHeader>
      <Logo />
      <nav className="ml-auto flex items-center gap-2 py-3">
        <BoutonMenu icon={RiLogoutBoxRLine} label="Se déconnecter" />
      </nav>
    </AppHeader>
  ),
};
