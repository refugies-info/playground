// @WIP — En attente de validation Margot
// Décision ouverte : fusionner badge + labels + arbitrage en un seul composant ?
// Stories à compléter une fois la structure des variants validée.

import { Badge } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Badge — Composant de statut
 *
 * Deux catégories sémantiques :
 * - **Validation** : fond clair, texte coloré (résultat d'une validation humaine ou IA)
 * - **Status**     : fond plein, texte blanc  (état du workflow d'une fiche RCO)
 *
 * Architecture 3 couches :
 * - Layer 1 `primitives.css`  → `--color-rco-pending: #F6C43C`
 * - Layer 2 `semantics.css`   → rôles UX généraux
 * - Layer 3 `Badge.css`       → `--badge-pending-bg: var(--color-rco-pending)`
 */
const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/* ── Validation ──────────────────────────────────── */

export const Validated: Story = {
  args: { variant: "validated", children: "Accepté" },
};

export const Refused: Story = {
  args: { variant: "refused", children: "Refusé" },
};

export const ConformAI: Story = {
  args: { variant: "conform-ai", children: "Conforme" },
};

export const Doublon: Story = {
  args: { variant: "doublon", children: "Doublon" },
};

/* ── Status workflow ─────────────────────────────── */

export const Pending: Story = {
  args: { variant: "pending", children: "À traiter" },
};

export const Draft: Story = {
  args: { variant: "draft", children: "Brouillon" },
};

export const Archived: Story = {
  args: { variant: "archived", children: "Archivé" },
};

export const Published: Story = {
  args: { variant: "published", children: "Publié" },
};

export const Review: Story = {
  args: { variant: "review", children: "À revoir" },
};

/* ── Tous les variants ───────────────────────────── */

export const AllVariants: Story = {
  name: "Tous les variants",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Validation
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="validated">Accepté</Badge>
          <Badge variant="refused">Refusé</Badge>
          <Badge variant="conform-ai">Conforme IA</Badge>
          <Badge variant="doublon">Doublon</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Status workflow
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="pending">À traiter</Badge>
          <Badge variant="draft">Brouillon</Badge>
          <Badge variant="archived">Archivé</Badge>
          <Badge variant="published">Publié</Badge>
          <Badge variant="review">À revoir</Badge>
        </div>
      </div>
    </div>
  ),
};
