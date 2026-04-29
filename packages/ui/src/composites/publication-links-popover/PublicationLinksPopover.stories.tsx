import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "../../primitives/tag";
import {
  type LanguagePublicationStatus,
  PublicationLinksPopover,
} from "./PublicationLinksPopover";

/**
 * PublicationLinksPopover — Statut de publication multi-langues.
 *
 * Popover déclenchée par le Tag "Publié" dans le header de l'éditeur.
 * Affiche toutes les langues RI : publiées (lien cliquable) ou non (grisé).
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1842-8998
 */

// Données inline — on n'importe pas @playground/shared-types ici pour éviter
// que LETTA_AGENTS_CONFIG (process.env) soit évalué dans le browser (Storybook).
const FAKE_BASE = "https://refugies.info";

const ALL_LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "Anglais" },
  { code: "ar", label: "Arabe" },
  { code: "ps", label: "Pachto" },
  { code: "fa", label: "Persan/Dari" },
  { code: "ru", label: "Russe" },
  { code: "ti", label: "Tigrinya" },
  { code: "uk", label: "Ukrainien" },
] as const;

// Réplique exacte du Figma (1842-8998) : FR + UK + AR publiés
const FIGMA_LANGUAGES: LanguagePublicationStatus[] = ALL_LANGUAGES.map((l) => ({
  code: l.code,
  label: l.label,
  publishedUrl: ["fr", "uk", "ar"].includes(l.code)
    ? l.code === "fr"
      ? `${FAKE_BASE}/dispositif/507f1f77bcf86cd799439011`
      : `${FAKE_BASE}/${l.code}/program/507f1f77bcf86cd799439011`
    : null,
}));

const meta: Meta<typeof PublicationLinksPopover> = {
  title: "Composites/PublicationLinksPopover",
  component: PublicationLinksPopover,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    children: <Tag status="publie" />,
    languages: FIGMA_LANGUAGES,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Réplique exacte du Figma — FR, Ukrainien, Arabe publiés, le reste grisé */
export const Default: Story = {};

/** Toutes les 8 langues publiées */
export const AllPublished: Story = {
  args: {
    languages: ALL_LANGUAGES.map((l) => ({
      code: l.code,
      label: l.label,
      publishedUrl:
        l.code === "fr"
          ? `${FAKE_BASE}/dispositif/507f1f77bcf86cd799439011`
          : `${FAKE_BASE}/${l.code}/program/507f1f77bcf86cd799439011`,
    })),
  },
};

/** Aucune traduction publiée (document en cours de publication) */
export const NonePublished: Story = {
  args: {
    languages: ALL_LANGUAGES.map((l) => ({
      code: l.code,
      label: l.label,
      publishedUrl: null,
    })),
  },
};

/** État chargement — fetch lazy en cours */
export const LoadingState: Story = {
  args: {
    languages: [],
    isLoading: true,
  },
};
