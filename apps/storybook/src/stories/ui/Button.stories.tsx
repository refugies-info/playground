import { Button } from "@playground/ui";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiEditLine,
  RiExternalLinkLine,
  RiInformationLine,
  RiMailLine,
  RiMapPinLine,
  RiSearchLine,
  RiUserLine,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";

const ICON_MAP = {
  "(aucune)": undefined,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiDownloadLine,
  RiSearchLine,
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAddLine,
  RiMailLine,
  RiMapPinLine,
  RiUserLine,
  RiInformationLine,
};

const FIGMA_URL =
  "https://www.figma.com/design/BLVTgrfTTyMWKgi2MaTTAk/Design-System?node-id=2801-17488";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  tags: ["autodocs"],
  // Valeurs par défaut pour que les toggles s'affichent directement
  args: {
    isLoading: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: [
        "primaire",
        "secondaire",
        "primaire-colore",
        "secondaire-colore",
        "tertiaire",
        "quatrieme",
        "violet",
      ],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "Taille=S → sm | Taille=M → md | Taille=L → lg",
    },
    isLoading: { control: "boolean" },
    disabled: { control: "boolean" },
    leftIcon: {
      control: "select",
      options: Object.keys(ICON_MAP),
      mapping: ICON_MAP,
    },
    rightIcon: {
      control: "select",
      options: Object.keys(ICON_MAP),
      mapping: ICON_MAP,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────────────────────────
// Variants — Statut=Défaut
// ─────────────────────────────────────────────────────────────────────────────

export const Primaire: Story = {
  name: "Primaire / Statut=Défaut",
  args: { variant: "primaire", children: "Commencer" },
};

export const Secondaire: Story = {
  name: "Secondaire / Statut=Défaut",
  args: { variant: "secondaire", children: "En savoir plus" },
};

export const Tertiaire: Story = {
  name: "Tertiaire / Statut=Défaut",
  args: { variant: "tertiaire", children: "Annuler" },
};

export const Quatrieme: Story = {
  name: "Quatrième / Statut=Défaut",
  args: { variant: "quatrieme", children: "Ignorer" },
};

// Le CTA Violet a son propre fond --blue-france-975-75 intégré,
// mais on le montre ici dans un contexte proche de son usage réel (champ de recherche)
export const Violet: Story = {
  name: "Violet / Statut=Défaut",
  args: { variant: "violet", children: "Utiliser ma position" },
  parameters: {
    backgrounds: { default: "coloré" },
  },
};

export const VioletSurvol: Story = {
  name: "Violet / Statut=Survol",
  args: { variant: "violet", children: "Utiliser ma position" },
  parameters: {
    pseudo: { hover: true },
    backgrounds: { default: "coloré" },
  },
};

const coloredDecorator = (Story: React.ComponentType) => (
  <div
    style={{
      background: "var(--blue-france-975-75)",
      padding: "1.5rem",
      borderRadius: "4px",
    }}
  >
    <Story />
  </div>
);

export const PrimaireColore: Story = {
  name: "Primaire coloré / Statut=Défaut",
  args: { variant: "primaire-colore", children: "Commencer" },
  decorators: [coloredDecorator],
};

export const SecondaireColore: Story = {
  name: "Secondaire coloré / Statut=Défaut",
  args: { variant: "secondaire-colore", children: "En savoir plus" },
  decorators: [coloredDecorator],
};

// ─────────────────────────────────────────────────────────────────────────────
// États — pseudo-states (hover / focus / active)
// ─────────────────────────────────────────────────────────────────────────────

export const PrimaireSurvol: Story = {
  name: "Primaire / Statut=Survol",
  args: { variant: "primaire", children: "Commencer" },
  parameters: { pseudo: { hover: true } },
};

export const PrimaireFocus: Story = {
  name: "Primaire / Statut=Focus",
  args: { variant: "primaire", children: "Commencer" },
  parameters: { pseudo: { focusVisible: true } },
};

export const PrimaireClique: Story = {
  name: "Primaire / Statut=Cliqué",
  args: { variant: "primaire", children: "Commencer" },
  parameters: { pseudo: { active: true } },
};

export const PrimaireInactif: Story = {
  name: "Primaire / Statut=Inactif",
  args: { variant: "primaire", children: "Commencer", disabled: true },
};

export const PrimaireChargement: Story = {
  name: "Primaire / Chargement",
  args: { variant: "primaire", children: "Enregistrement…", isLoading: true },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tailles — Taille=S / M / L
// ─────────────────────────────────────────────────────────────────────────────

export const Tailles: Story = {
  name: "Tailles (S / M / L)",
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Button variant="primaire" size="sm">
          Taille=S
        </Button>
        <span className="text-xs text-gray-400">sm · 32px · 14px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant="primaire" size="md">
          Taille=M
        </Button>
        <span className="text-xs text-gray-400">md · 40px · 16px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant="primaire" size="lg">
          Taille=L
        </Button>
        <span className="text-xs text-gray-400">lg · 48px · 18px</span>
      </div>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Icône seule — Icône seule=on
// ─────────────────────────────────────────────────────────────────────────────

export const IconeSeule: Story = {
  name: "Icône seule (S / M / L)",
  render: () => (
    <div className="flex items-end gap-4">
      <Button
        variant="primaire"
        size="sm"
        leftIcon={RiInformationLine}
        aria-label="Info"
      />
      <Button
        variant="primaire"
        size="md"
        leftIcon={RiInformationLine}
        aria-label="Info"
      />
      <Button
        variant="primaire"
        size="lg"
        leftIcon={RiInformationLine}
        aria-label="Info"
      />
    </div>
  ),
};

export const AvecIcones: Story = {
  name: "Avec icônes (gauche / droite)",
  render: () => (
    <div className="flex flex-col gap-3">
      <Button variant="primaire" leftIcon={RiArrowRightLine}>
        Icône gauche
      </Button>
      <Button variant="primaire" rightIcon={RiExternalLinkLine}>
        Icône droite
      </Button>
      <Button variant="secondaire" leftIcon={RiDownloadLine}>
        Télécharger
      </Button>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Grille complète — tous les variants × états
// ─────────────────────────────────────────────────────────────────────────────

export const GrilleComplète: Story = {
  name: "Grille — tous les variants × états",
  parameters: { layout: "padded" },
  render: () => {
    const variants = [
      { key: "primaire", label: "Primaire" },
      { key: "secondaire", label: "Secondaire" },
      { key: "tertiaire", label: "Tertiaire" },
      { key: "quatrieme", label: "Quatrième" },
      { key: "violet", label: "Violet" },
    ] as const;

    const coloreVariants = [
      { key: "primaire-colore", label: "Primaire coloré" },
      { key: "secondaire-colore", label: "Secondaire coloré" },
    ] as const;

    return (
      <div className="flex flex-col gap-8 p-4">
        {/* Mode clair */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">
            Fond clair
          </p>
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-xs text-gray-400 font-normal w-40">
                  Variant
                </th>
                <th className="px-3 py-2 text-xs text-gray-400 font-normal">
                  Défaut
                </th>
                <th className="px-3 py-2 text-xs text-gray-400 font-normal">
                  Inactif
                </th>
                <th className="px-3 py-2 text-xs text-gray-400 font-normal">
                  Chargement
                </th>
                <th className="px-3 py-2 text-xs text-gray-400 font-normal">
                  Taille=S
                </th>
                <th className="px-3 py-2 text-xs text-gray-400 font-normal">
                  Taille=L
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.map(({ key, label }) => (
                <tr key={key} className="border-t border-gray-100">
                  <td className="px-3 py-3 text-xs text-gray-500">{label}</td>
                  <td className="px-3 py-3">
                    <Button variant={key}>Commencer</Button>
                  </td>
                  <td className="px-3 py-3">
                    <Button variant={key} disabled>
                      Commencer
                    </Button>
                  </td>
                  <td className="px-3 py-3">
                    <Button variant={key} isLoading>
                      Commencer
                    </Button>
                  </td>
                  <td className="px-3 py-3">
                    <Button variant={key} size="sm">
                      Commencer
                    </Button>
                  </td>
                  <td className="px-3 py-3">
                    <Button variant={key} size="lg">
                      Commencer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mode coloré */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">
            Fond coloré
          </p>
          <div
            className="inline-flex gap-6 p-6 rounded"
            style={{ background: "var(--blue-france-975-75)" }}
          >
            {coloreVariants.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-3">
                <span className="text-xs text-gray-400">{label}</span>
                <Button variant={key}>Commencer</Button>
                <Button variant={key} disabled>
                  Inactif
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};
