/**
 * Storybook Preview Configuration
 *
 * Addons actifs :
 *   - @storybook/addon-a11y          : audit WCAG automatique sur chaque story
 *   - storybook-addon-pseudo-states  : simuler :hover / :focus / :active dans le canvas
 */

import type { Preview } from "@storybook/react";
import "./globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",

    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "coloré", value: "var(--blue-france-975-75)" },
      ],
    },

    // ── a11y ──────────────────────────────────────────────────────────────────
    // Audit axe-core sur chaque story. Les violations bloquantes sont signalées
    // en rouge dans le panneau Accessibility.
    a11y: {
      // Désactive uniquement les règles non pertinentes pour un DS headless
      // (pas de <html lang>, pas de <title> — c'est le contexte de la page hôte)
      config: {
        rules: [
          { id: "html-has-lang", enabled: false },
          { id: "document-title", enabled: false },
          { id: "landmark-one-main", enabled: false },
          { id: "page-has-heading-one", enabled: false },
          { id: "region", enabled: false },
        ],
      },
      // "warn" = signale sans bloquer | "error" = fait échouer les tests a11y
      options: {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      },
    },

    // ── pseudo-states ─────────────────────────────────────────────────────────
    // Configuration par défaut — peut être surchargée par story via `parameters.pseudo`
    pseudo: {},
  },

  tags: ["autodocs"],
};

export default preview;
