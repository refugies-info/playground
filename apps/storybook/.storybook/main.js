/**
 * Storybook Configuration
 *
 * WHY JavaScript instead of TypeScript?
 * Storybook 8.x uses esbuild-register internally which has issues with ESM + TypeScript.
 * Using JavaScript with JSDoc type annotations avoids these issues while keeping type safety.
 *
 * @see https://github.com/storybookjs/storybook/issues/23125
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/postcss";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    "@storybook/addon-docs", // Auto-generate documentation from component props
    "@storybook/addon-a11y", // Accessibility testing
    "@chromatic-com/storybook", // Visual testing integration
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  viteFinal: async (config) => {
    // Resolve @playground/ui to source files directly (not dist)
    // This enables hot-reload when developing UI components
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@playground/ui": resolve(__dirname, "../../../packages/ui/src/index.ts"),
    };

    // Configure Tailwind CSS v4 via PostCSS
    // Required for processing @import "tailwindcss" in globals.css
    config.css = config.css || {};
    config.css.postcss = {
      plugins: [tailwindcss],
    };

    return config;
  },
};

export default config;
