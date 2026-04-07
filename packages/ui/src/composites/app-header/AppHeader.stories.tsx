import { AppHeader, AppLogo, BoutonMenu } from "@playground/ui";
import {
  RiAccountCircleLine,
  RiDownloadLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiTranslate2,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Barre de navigation principale — slot composition.
 *
 * Logo à gauche, <nav> + BoutonMenu à droite.
 * Le layout (hauteur, flex) est géré par AppHeader, le contenu est libre.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8294
 */
const meta: Meta<typeof AppHeader> = {
  component: AppHeader,
  title: "Composites/AppHeader",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8294",
    },
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

const Nav = ({ children }: { children: React.ReactNode }) => (
  <nav className="ml-auto flex items-center gap-2 py-3">{children}</nav>
);

/** Header admin complet — tous les accès rapides visibles */
export const Admin: Story = {
  name: "Admin — tous les accès",
  render: () => (
    <AppHeader>
      <Logo />
      <Nav>
        <BoutonMenu icon={RiDownloadLine} label="Importer" />
        <BoutonMenu icon={RiFileTextLine} label="Fiches" active />
        <BoutonMenu icon={RiTranslate2} label="Espace de traduction" />
        <BoutonMenu icon={RiAccountCircleLine} label="Utilisateurs" />
        <BoutonMenu icon={RiLogoutBoxRLine} label="Se déconnecter" />
      </Nav>
    </AppHeader>
  ),
};

/** Header admin — page Espace de traduction active */
export const AdminTraduction: Story = {
  name: "Admin — Traduction active",
  render: () => (
    <AppHeader>
      <Logo />
      <Nav>
        <BoutonMenu icon={RiDownloadLine} label="Importer" />
        <BoutonMenu icon={RiFileTextLine} label="Fiches" />
        <BoutonMenu icon={RiTranslate2} label="Espace de traduction" active />
        <BoutonMenu icon={RiAccountCircleLine} label="Utilisateurs" />
        <BoutonMenu icon={RiLogoutBoxRLine} label="Se déconnecter" />
      </Nav>
    </AppHeader>
  ),
};

/** Header éditeur — pas d'accès à Importer ni Utilisateurs */
export const Editeur: Story = {
  name: "Éditeur — accès réduit",
  render: () => (
    <AppHeader>
      <Logo />
      <Nav>
        <BoutonMenu icon={RiFileTextLine} label="Fiches" active />
        <BoutonMenu icon={RiTranslate2} label="Espace de traduction" />
        <BoutonMenu icon={RiLogoutBoxRLine} label="Se déconnecter" />
      </Nav>
    </AppHeader>
  ),
};

/** Header traducteur — seul Se déconnecter visible */
export const Traducteur: Story = {
  name: "Traducteur — minimal",
  render: () => (
    <AppHeader>
      <Logo />
      <Nav>
        <BoutonMenu icon={RiLogoutBoxRLine} label="Se déconnecter" />
      </Nav>
    </AppHeader>
  ),
};
