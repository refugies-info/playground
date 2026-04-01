import * as addonA11y from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { beforeAll } from "vitest";
import * as projectAnnotations from "./.storybook/preview";

// Inclure les annotations de l'addon a11y pour que les vérifications
// axe-core tournent automatiquement après chaque story rendue.
// Les violations font échouer le test (niveau configuré dans preview.ts).
const annotations = setProjectAnnotations([addonA11y, projectAnnotations]);

beforeAll(annotations.beforeAll);
