import { SegmentedControl } from "@playground/ui";
import {
  RiCodeSSlashLine,
  RiEyeLine,
  RiLayoutLeftLine,
  RiListCheck3,
  RiSearchLine,
  RiSettingsLine,
} from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

/**
 * Contrôle segmenté accessible — inspiré iOS/Figma.
 *
 * Deux déclinaisons DSFR, partageant le rôle `radiogroup` et la navigation
 * clavier mais rien de leur style :
 *   - `slider` (défaut) : icône seule, pastille blanche glissante
 *   - `outlined`        : libellé texte, option active cerclée de bleu
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1385-11486
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=4107-31438
 */
const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  title: "Primitives/SegmentedControl",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const EDITOR_OPTIONS = [
  { value: "visual" as const, icon: RiEyeLine, label: "Visuel" },
  { value: "raw" as const, icon: RiCodeSSlashLine, label: "Markdown" },
];

export const Defaut: Story = {
  render: () => {
    const [mode, setMode] = useState<"visual" | "raw">("visual");
    return (
      <SegmentedControl
        options={EDITOR_OPTIONS}
        value={mode}
        onChange={setMode}
        aria-label="Mode d'édition"
      />
    );
  },
};

export const RawActif: Story = {
  render: () => {
    const [mode, setMode] = useState<"visual" | "raw">("raw");
    return (
      <SegmentedControl
        options={EDITOR_OPTIONS}
        value={mode}
        onChange={setMode}
        aria-label="Mode d'édition"
      />
    );
  },
};

export const Desactive: Story = {
  render: () => (
    <SegmentedControl
      options={EDITOR_OPTIONS}
      value="visual"
      onChange={() => {}}
      disabled
      aria-label="Mode d'édition (désactivé)"
    />
  ),
};

const FOUR_OPTIONS = [
  { value: "layout" as const, icon: RiLayoutLeftLine, label: "Mise en page" },
  { value: "list" as const, icon: RiListCheck3, label: "Liste" },
  { value: "search" as const, icon: RiSearchLine, label: "Recherche" },
  { value: "settings" as const, icon: RiSettingsLine, label: "Paramètres" },
];

export const QuatreElements: Story = {
  render: () => {
    const [tab, setTab] = useState<"layout" | "list" | "search" | "settings">(
      "layout",
    );
    return (
      <SegmentedControl
        options={FOUR_OPTIONS}
        value={tab}
        onChange={setTab}
        aria-label="Navigation"
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Variante outlined — libellés texte, sans indicateur glissant
// ---------------------------------------------------------------------------

type NotificationTab = "all" | "unread" | "archived";

/**
 * Onglets du panneau de notifications : les libellés portent un compteur, d'où
 * des segments dimensionnés au contenu plutôt qu'à largeurs égales.
 */
export const OutlinedAvecCompteurs: Story = {
  render: () => {
    const [tab, setTab] = useState<NotificationTab>("all");
    return (
      <SegmentedControl
        variant="outlined"
        options={[
          { value: "all" as const, label: "Toutes (5)" },
          { value: "unread" as const, label: "Non lues (2)" },
          { value: "archived" as const, label: "Archivées (23)" },
        ]}
        value={tab}
        onChange={setTab}
        aria-label="Filtrer les notifications par statut"
      />
    );
  },
};

/** Un libellé bien plus long que les autres — vérifie l'absence de troncature. */
export const OutlinedLibellesInegaux: Story = {
  render: () => {
    const [value, setValue] = useState<"court" | "long">("court");
    return (
      <SegmentedControl
        variant="outlined"
        options={[
          { value: "court" as const, label: "Toutes (5)" },
          {
            value: "long" as const,
            label: "Archivées il y a longtemps (1234)",
          },
        ]}
        value={value}
        onChange={setValue}
        aria-label="Libellés de longueurs inégales"
      />
    );
  },
};

/** L'icône reste possible en `outlined` : elle remplace alors le libellé. */
export const OutlinedAvecIcone: Story = {
  render: () => {
    const [mode, setMode] = useState<"visual" | "raw">("visual");
    return (
      <SegmentedControl
        variant="outlined"
        options={EDITOR_OPTIONS}
        value={mode}
        onChange={setMode}
        aria-label="Mode d'édition"
      />
    );
  },
};
