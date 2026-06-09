import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/postcss";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    storybookTest({
      // Pointe vers le dossier .storybook pour récupérer la config
      configDir: resolve(__dirname, ".storybook"),
    }),
  ],

  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },

  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@playground/ui/icons": resolve(
        __dirname,
        "../../packages/ui/src/icons.ts",
      ),
      "@playground/ui": resolve(__dirname, "../../packages/ui/src/index.ts"),
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-dev-runtime",
    ],
  },

  test: {
    name: "storybook",

    // Browser Mode — rend les stories dans un vrai Chromium
    // (nécessaire pour axe-core et les tests d'interaction réalistes)
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },

    setupFiles: ["./vitest.setup.ts"],

    // Timeout généreux — la première story de chaque fichier inclut
    // le démarrage du browser + chargement Storybook + CSS DSFR
    testTimeout: 30000,
  },
});
