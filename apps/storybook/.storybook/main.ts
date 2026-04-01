/**
 * Storybook 10 Configuration
 *
 * Storybook 10 is ESM-only, which means:
 * - No more CommonJS/ESM compatibility issues
 * - Native ESM imports throughout
 * - TypeScript config files work natively (.ts)
 * - Smaller install size (29% reduction)
 *
 * @see https://storybook.js.org/docs/configure
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/postcss";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  // Fonts DSFR — Vite ne résout pas les url() dans les CSS importés via
  // PostCSS/Tailwind layer(). On les sert en static à /fonts/ pour que
  // les chemins relatifs ../fonts/ du CSS builté (/assets/) résolvent correctement.
  staticDirs: [
    {
      from: "../../../node_modules/@gouvfr/dsfr/dist/fonts",
      to: "/fonts",
    },
  ],

  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "storybook-addon-pseudo-states",
    "@storybook/addon-designs",
    // NOTE: @chromatic-com/storybook not yet compatible with Storybook 10
    // Will be added when compatible version is available
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@playground/ui/icons": resolve(
        __dirname,
        "../../../packages/ui/src/icons.ts",
      ),
      "@playground/ui": resolve(__dirname, "../../../packages/ui/src/index.ts"),
    };

    config.css = config.css || {};
    config.css.postcss = {
      plugins: [tailwindcss],
    };

    return config;
  },
};

export default config;
