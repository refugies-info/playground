import { AppLogo, BoutonMenu, Sidebar } from "@playground/ui";
import {
  RiAccountCircleLine,
  RiDownloadLine,
  RiFileTextLine,
  RiTranslate2,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

/**
 * Barre de navigation latérale gauche repliable.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1365-13876
 *
 * 2 variantes Figma :
 * - Plié?=off (déployé) — Logo + texte, labels de navigation visibles
 * - Plié?=on  (replié)  — icône seule, labels masqués (tooltip au survol)
 *
 * Le bouton toggle est en bas à droite (déployé) ou en bas au centre (replié).
 */
const meta: Meta<typeof Sidebar> = {
  component: Sidebar,
  title: "Composites/Sidebar",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1365-13876",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Composants réutilisables ─────────────────────────────────────────────────

const LogoImage = () => (
  <img src="/logo-ri.svg" alt="Logo" className="h-6 w-6" />
);

const UserAvatar = ({ initial }: { initial: string }) => (
  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
    {initial}
  </div>
);

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Sidebar déployée — état par défaut (Plié?=off) */
export const Deployee: Story = {
  name: "Déployée (Plié?=off)",
  render: () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
      <div className="h-screen flex">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((c) => !c)}
          logo={
            <AppLogo
              image={<LogoImage />}
              title="BOMO"
              collapsed={isCollapsed}
            />
          }
          userAvatar={<UserAvatar initial="J" />}
        >
          <BoutonMenu
            icon={RiFileTextLine}
            label="Fiches"
            active
            iconOnly={isCollapsed}
          />
          <BoutonMenu
            icon={RiTranslate2}
            label="Espace de traduction"
            iconOnly={isCollapsed}
          />
          <BoutonMenu
            icon={RiAccountCircleLine}
            label="Utilisateurs"
            iconOnly={isCollapsed}
          />
        </Sidebar>
        <div className="flex-1 bg-gray-50 p-8 text-gray-400 text-sm">
          Contenu principal
        </div>
      </div>
    );
  },
};

/** Sidebar repliée — état compact (Plié?=on) */
export const Repliee: Story = {
  name: "Repliée (Plié?=on)",
  render: () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
      <div className="h-screen flex">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((c) => !c)}
          logo={
            <AppLogo
              image={<LogoImage />}
              title="BOMO"
              collapsed={isCollapsed}
            />
          }
          userAvatar={<UserAvatar initial="J" />}
        >
          <BoutonMenu
            icon={RiFileTextLine}
            label="Fiches"
            active
            iconOnly={isCollapsed}
          />
          <BoutonMenu
            icon={RiTranslate2}
            label="Espace de traduction"
            iconOnly={isCollapsed}
          />
          <BoutonMenu
            icon={RiAccountCircleLine}
            label="Utilisateurs"
            iconOnly={isCollapsed}
          />
        </Sidebar>
        <div className="flex-1 bg-gray-50 p-8 text-gray-400 text-sm">
          Contenu principal
        </div>
      </div>
    );
  },
};

/** Sidebar interactive — toggle déployé/replié en cliquant le bouton bas */
export const Interactive: Story = {
  name: "Interactive (toggle)",
  render: () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
      <div className="h-screen flex">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((c) => !c)}
          logo={
            <AppLogo
              image={<LogoImage />}
              title="BOMO"
              collapsed={isCollapsed}
            />
          }
          userAvatar={<UserAvatar initial="J" />}
        >
          <BoutonMenu
            icon={RiDownloadLine}
            label="Importer"
            iconOnly={isCollapsed}
          />
          <BoutonMenu
            icon={RiFileTextLine}
            label="Fiches"
            active
            iconOnly={isCollapsed}
          />
          <BoutonMenu
            icon={RiTranslate2}
            label="Espace de traduction"
            iconOnly={isCollapsed}
          />
          <BoutonMenu
            icon={RiAccountCircleLine}
            label="Utilisateurs"
            iconOnly={isCollapsed}
          />
        </Sidebar>
        <div className="flex-1 bg-gray-50 p-8">
          <p className="text-sm text-gray-500">
            Clique le bouton en bas de la sidebar pour replier/déployer.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            État : {isCollapsed ? "replié" : "déployé"}
          </p>
        </div>
      </div>
    );
  },
};

/** Sidebar sans avatar utilisateur */
export const SansAvatar: Story = {
  name: "Sans avatar",
  render: () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
      <div className="h-screen flex">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((c) => !c)}
          logo={
            <AppLogo
              image={<LogoImage />}
              title="BOMO"
              collapsed={isCollapsed}
            />
          }
        >
          <BoutonMenu
            icon={RiFileTextLine}
            label="Fiches"
            active
            iconOnly={isCollapsed}
          />
          <BoutonMenu
            icon={RiTranslate2}
            label="Espace de traduction"
            iconOnly={isCollapsed}
          />
        </Sidebar>
        <div className="flex-1 bg-gray-50 p-8 text-gray-400 text-sm">
          Contenu principal
        </div>
      </div>
    );
  },
};
