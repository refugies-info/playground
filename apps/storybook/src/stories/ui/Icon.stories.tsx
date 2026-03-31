/**
 * Icon stories — galerie Remix Icons (= icônes DSFR)
 *
 * Convention de nommage :
 *   import { RiArrowRightLine } from "@playground/ui/icons"
 *   DSFR : .fr-icon-arrow-right-line  →  @remixicon/react : RiArrowRightLine
 */

import type { IconRef, IconSize } from "@playground/ui";
import { Button, Icon } from "@playground/ui";
import * as AllIcons from "@playground/ui/icons";
import {
  RiAccountCircleLine,
  RiAddLine,
  RiAlertLine,
  RiArrowDownLine,
  RiArrowLeftLine,
  RiArrowLeftSLine,
  // Flèches
  RiArrowRightLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiChat1Line,
  RiCheckboxCircleLine,
  // Système
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiEditLine,
  // Statuts
  RiErrorWarningLine,
  RiExternalLinkLine,
  // Document
  RiFileLine,
  RiFilterLine,
  RiFolderLine,
  RiInformationLine,
  // Communication
  RiMailLine,
  RiMapLine,
  // Localisation
  RiMapPinLine,
  RiMenuLine,
  RiMoreLine,
  RiNavigationLine,
  RiNotificationLine,
  RiPhoneLine,
  RiSearchLine,
  RiSettings5Line,
  RiTeamLine,
  RiUploadLine,
  RiUserFill,
  // Utilisateur
  RiUserLine,
} from "@playground/ui/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ICON_CATEGORIES } from "../../lib/remixicon-categories";

// ── Types ────────────────────────────────────────────────────────────────────

type IconEntry = {
  icon: IconRef;
  name: string; // nom du composant @remixicon/react
  dsfr: string; // classe DSFR équivalente
};

type Category = {
  label: string;
  icons: IconEntry[];
};

const CATEGORIES: Category[] = [
  {
    label: "Flèches",
    icons: [
      {
        icon: RiArrowRightLine,
        name: "RiArrowRightLine",
        dsfr: "fr-icon-arrow-right-line",
      },
      {
        icon: RiArrowLeftLine,
        name: "RiArrowLeftLine",
        dsfr: "fr-icon-arrow-left-line",
      },
      {
        icon: RiArrowUpLine,
        name: "RiArrowUpLine",
        dsfr: "fr-icon-arrow-up-line",
      },
      {
        icon: RiArrowDownLine,
        name: "RiArrowDownLine",
        dsfr: "fr-icon-arrow-down-line",
      },
      {
        icon: RiArrowRightSLine,
        name: "RiArrowRightSLine",
        dsfr: "fr-icon-arrow-right-s-line",
      },
      {
        icon: RiArrowLeftSLine,
        name: "RiArrowLeftSLine",
        dsfr: "fr-icon-arrow-left-s-line",
      },
      {
        icon: RiExternalLinkLine,
        name: "RiExternalLinkLine",
        dsfr: "fr-icon-external-link-line",
      },
    ],
  },
  {
    label: "Système",
    icons: [
      { icon: RiCheckLine, name: "RiCheckLine", dsfr: "fr-icon-check-line" },
      { icon: RiCloseLine, name: "RiCloseLine", dsfr: "fr-icon-close-line" },
      { icon: RiAddLine, name: "RiAddLine", dsfr: "fr-icon-add-line" },
      { icon: RiSearchLine, name: "RiSearchLine", dsfr: "fr-icon-search-line" },
      { icon: RiFilterLine, name: "RiFilterLine", dsfr: "fr-icon-filter-line" },
      { icon: RiMenuLine, name: "RiMenuLine", dsfr: "fr-icon-menu-line" },
      {
        icon: RiSettings5Line,
        name: "RiSettings5Line",
        dsfr: "fr-icon-settings-5-line",
      },
      { icon: RiMoreLine, name: "RiMoreLine", dsfr: "fr-icon-more-line" },
    ],
  },
  {
    label: "Utilisateur",
    icons: [
      { icon: RiUserLine, name: "RiUserLine", dsfr: "fr-icon-user-line" },
      { icon: RiUserFill, name: "RiUserFill", dsfr: "fr-icon-user-fill" },
      { icon: RiTeamLine, name: "RiTeamLine", dsfr: "fr-icon-team-line" },
      {
        icon: RiAccountCircleLine,
        name: "RiAccountCircleLine",
        dsfr: "fr-icon-account-circle-line",
      },
    ],
  },
  {
    label: "Communication",
    icons: [
      { icon: RiMailLine, name: "RiMailLine", dsfr: "fr-icon-mail-line" },
      { icon: RiPhoneLine, name: "RiPhoneLine", dsfr: "fr-icon-phone-line" },
      { icon: RiChat1Line, name: "RiChat1Line", dsfr: "fr-icon-chat-1-line" },
      {
        icon: RiNotificationLine,
        name: "RiNotificationLine",
        dsfr: "fr-icon-notification-line",
      },
    ],
  },
  {
    label: "Document",
    icons: [
      { icon: RiFileLine, name: "RiFileLine", dsfr: "fr-icon-file-line" },
      { icon: RiFolderLine, name: "RiFolderLine", dsfr: "fr-icon-folder-line" },
      {
        icon: RiDownloadLine,
        name: "RiDownloadLine",
        dsfr: "fr-icon-download-line",
      },
      { icon: RiUploadLine, name: "RiUploadLine", dsfr: "fr-icon-upload-line" },
      { icon: RiEditLine, name: "RiEditLine", dsfr: "fr-icon-edit-line" },
      {
        icon: RiDeleteBinLine,
        name: "RiDeleteBinLine",
        dsfr: "fr-icon-delete-bin-line",
      },
    ],
  },
  {
    label: "Localisation",
    icons: [
      {
        icon: RiMapPinLine,
        name: "RiMapPinLine",
        dsfr: "fr-icon-map-pin-line",
      },
      {
        icon: RiNavigationLine,
        name: "RiNavigationLine",
        dsfr: "fr-icon-navigation-line",
      },
      { icon: RiMapLine, name: "RiMapLine", dsfr: "fr-icon-map-line" },
    ],
  },
  {
    label: "Statuts",
    icons: [
      {
        icon: RiErrorWarningLine,
        name: "RiErrorWarningLine",
        dsfr: "fr-icon-error-warning-line",
      },
      {
        icon: RiInformationLine,
        name: "RiInformationLine",
        dsfr: "fr-icon-information-line",
      },
      {
        icon: RiCheckboxCircleLine,
        name: "RiCheckboxCircleLine",
        dsfr: "fr-icon-checkbox-circle-line",
      },
      { icon: RiAlertLine, name: "RiAlertLine", dsfr: "fr-icon-alert-line" },
    ],
  },
];

// ── Meta ─────────────────────────────────────────────────────────────────────

// Sélection d'icônes exposées dans le control (strings → composants via mapping)
const ICON_OPTIONS = {
  RiArrowRightLine,
  RiArrowLeftLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowRightSLine,
  RiExternalLinkLine,
  RiCheckLine,
  RiCloseLine,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiMenuLine,
  RiSettings5Line,
  RiMoreLine,
  RiUserLine,
  RiUserFill,
  RiTeamLine,
  RiAccountCircleLine,
  RiMailLine,
  RiPhoneLine,
  RiChat1Line,
  RiNotificationLine,
  RiFileLine,
  RiFolderLine,
  RiDownloadLine,
  RiUploadLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMapPinLine,
  RiNavigationLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiCheckboxCircleLine,
  RiAlertLine,
} satisfies Record<string, IconRef>;

const meta = {
  title: "UI/Icon",
  component: Icon,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: Object.keys(ICON_OPTIONS),
      mapping: ICON_OPTIONS,
      description: 'import { RiXxx } from "@playground/ui/icons"',
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"] satisfies IconSize[],
      description: "xs=12px · sm=16px · md=24px · lg=32px (tailles DSFR)",
    },
  },
  args: {
    icon: RiArrowRightLine,
    size: "md",
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ──────────────────────────────────────────────────────────────────

export const Défaut: Story = {
  name: "Défaut",
  args: {
    icon: RiArrowRightLine,
    size: "md",
  },
};

export const TaillesDSFR: Story = {
  name: "Tailles DSFR (xs / sm / md / lg)",
  render: () => (
    <div className="flex items-end gap-6">
      {(["xs", "sm", "md", "lg"] as IconSize[]).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon icon={RiArrowRightLine} size={size} />
          <span className="text-xs text-gray-400">
            {size} ·{" "}
            {size === "xs"
              ? "12"
              : size === "sm"
                ? "16"
                : size === "md"
                  ? "24"
                  : "32"}
            px
          </span>
        </div>
      ))}
    </div>
  ),
};

export const CouleurHéritée: Story = {
  name: "Couleur héritée (currentColor)",
  render: () => (
    <div className="flex gap-6">
      <span className="text-[var(--text-action-high-blue-france)]">
        <Icon icon={RiCheckboxCircleLine} size="md" />
      </span>
      <span className="text-[var(--text-default-error)]">
        <Icon icon={RiErrorWarningLine} size="md" />
      </span>
      <span className="text-[var(--text-default-success)]">
        <Icon icon={RiCheckLine} size="md" />
      </span>
      <span className="text-[var(--text-default-warning)]">
        <Icon icon={RiAlertLine} size="md" />
      </span>
    </div>
  ),
};

export const Accessibilité: Story = {
  name: "Accessibilité (décorative vs sémantique)",
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-3">
        <Icon icon={RiSearchLine} size="sm" />
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {'// aria-hidden="true" (décorative, défaut)'}
        </code>
      </div>
      <div className="flex items-center gap-3">
        <Icon icon={RiMapPinLine} size="sm" aria-label="Localisation" />
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {'// aria-label="Localisation" → role="img"'}
        </code>
      </div>
    </div>
  ),
};

export const DansUnBouton: Story = {
  name: "Dans un Button (taille auto)",
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest">
        Il suffit de passer la ref — Button gère la taille automatiquement
      </p>
      <div className="flex items-center gap-3">
        <Button size="sm" leftIcon={RiArrowRightLine}>
          Taille=S
        </Button>
        <Button size="md" leftIcon={RiArrowRightLine}>
          Taille=M
        </Button>
        <Button size="lg" leftIcon={RiArrowRightLine}>
          Taille=L
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button size="md" rightIcon={RiExternalLinkLine}>
          Lien externe
        </Button>
        <Button size="md" variant="secondaire" leftIcon={RiDownloadLine}>
          Télécharger
        </Button>
        <Button size="md" variant="tertiaire" leftIcon={RiCloseLine}>
          Annuler
        </Button>
      </div>
    </div>
  ),
};

export const TousLesIcones: Story = {
  name: "Tableau — toutes les icônes (2264)",
  parameters: { layout: "padded" },
  render: () => {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("tous");

    // Conversion nom React → classe DSFR équivalente
    // RiArrowRightLine → fr-icon-arrow-right-line
    // FrErrorFill → fr-icon-error-fill (custom DSFR, prefixe "Fr")
    const toDsfr = (name: string) => {
      const stripped = name.replace(/^Ri/, "").replace(/^Fr/, "fr--");
      return `fr-icon-${stripped
        .replace(/([A-Z])/g, (_, l: string, i: number) =>
          i === 0 ? l : `-${l}`,
        )
        .toLowerCase()}`;
    };

    // Toutes les icônes du barrel
    const allEntries = Object.entries(AllIcons).filter(
      ([name]) => name !== "RemixiconComponentType",
    ) as [string, IconRef][];

    // Icônes custom DSFR = celles qui ne commencent pas par "Ri"
    const dsfrCustomNames = allEntries
      .filter(([n]) => !n.startsWith("Ri"))
      .map(([n]) => n);

    // Icônes filtrées par onglet puis par recherche
    const visibleEntries = allEntries.filter(([name]) => {
      const matchesSearch =
        !search.trim() || name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (activeTab === "tous") return true;
      if (activeTab === "dsfr-custom") return dsfrCustomNames.includes(name);
      const cat = ICON_CATEGORIES.find((c) => c.key === activeTab);
      return cat?.icons.includes(name) ?? false;
    });

    // Nombre d'icônes par onglet (avec filtre recherche appliqué)
    const countFor = (key: string) => {
      const matchSearch = ([n]: [string, unknown]) =>
        !search || n.toLowerCase().includes(search.toLowerCase());
      if (key === "tous") return allEntries.filter(matchSearch).length;
      if (key === "dsfr-custom")
        return allEntries
          .filter(([n]) => dsfrCustomNames.includes(n))
          .filter(matchSearch).length;
      return allEntries.filter(
        ([n]) =>
          matchSearch([n, null]) &&
          (ICON_CATEGORIES.find((c) => c.key === key)?.icons.includes(n) ??
            false),
      ).length;
    };

    const tabs = [
      { key: "tous", label: "Tous" },
      { key: "dsfr-custom", label: "Custom DSFR" },
      ...ICON_CATEGORIES.map(({ key, label }) => ({ key, label })),
    ];

    return (
      <div className="flex flex-col gap-0">
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 pb-4">
          <input
            type="search"
            placeholder="Rechercher une icône…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm w-72 focus:outline-none focus:border-[var(--border-action-high-blue-france)]"
          />
          <span className="text-xs text-gray-400">
            {visibleEntries.length} icône{visibleEntries.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0 mb-4">
          {tabs.map(({ key, label }) => {
            const count = countFor(key);
            if (count === 0 && key !== "tous") return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={[
                  "px-3 py-2 text-xs font-medium rounded-t border-b-2 transition-colors whitespace-nowrap",
                  activeTab === key
                    ? "border-[var(--border-action-high-blue-france)] text-[var(--text-action-high-blue-france)] bg-[var(--background-alt-blue-france)]"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300",
                ].join(" ")}
              >
                {label}
                <span className="ml-1.5 text-gray-400 font-normal">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grille d'icônes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {visibleEntries.map(([name, IconComponent]) => (
            <div
              key={name}
              className="flex items-center gap-3 p-3 rounded border border-gray-100 hover:border-[var(--border-action-high-blue-france)] hover:bg-[var(--background-alt-blue-france)] transition-colors cursor-default"
              title={`.${toDsfr(name)}`}
            >
              <Icon icon={IconComponent} size="md" />
              <div className="min-w-0">
                <p className="text-xs font-mono truncate text-gray-800 leading-tight">
                  {name.replace(/Icon$/, "")}
                </p>
                <p className="text-xs font-mono truncate text-gray-400 leading-tight mt-0.5">
                  .{toDsfr(name)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const Galerie: Story = {
  name: "Galerie — toutes les catégories",
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-10 p-2">
      {CATEGORIES.map(({ label, icons }) => (
        <div key={label}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">
            {label}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {icons.map(({ icon, name, dsfr }) => (
              <div
                key={name}
                className="flex items-center gap-3 p-3 rounded border border-gray-100 hover:border-gray-300 transition-colors"
              >
                <Icon icon={icon} size="md" />
                <div className="min-w-0">
                  <p className="text-xs font-mono truncate text-gray-800">
                    {name}
                  </p>
                  <p className="text-xs font-mono truncate text-gray-400">
                    .{dsfr}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
