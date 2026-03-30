import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import tailwindcss from "@tailwindcss/postcss";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@playground/ui": resolve(__dirname, "../../../packages/ui/src/index.ts"),
    };
    
    config.css = config.css || {};
    config.css.postcss = {
      plugins: [tailwindcss]
    };
    
    return config;
  }
};

export default config;
