#!/usr/bin/env node
/**
 * Génère apps/storybook/src/lib/remixicon-all.ts
 * Re-exporte toutes les icônes de remixicon-react pour la galerie Storybook.
 *
 * Usage : node apps/storybook/src/lib/generate-remixicon.mjs
 */
import { readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const pkgDir = dirname(require.resolve("remixicon-react/package.json"));
const files = readdirSync(pkgDir)
  .filter((f) => f.endsWith(".js") && !f.startsWith("dist"))
  .map((f) => f.replace(/\.js$/, ""))
  .sort();

const lines = [
  "// AUTO-GENERATED — ne pas éditer",
  "// Script : apps/storybook/src/lib/generate-remixicon.mjs",
  "",
  ...files.map(
    (name) => `export { default as ${name} } from "remixicon-react/${name}"`,
  ),
];

const out = resolve(__dirname, "remixicon-all.ts");
writeFileSync(out, lines.join("\n") + "\n");
console.log(`✅  ${files.length} icônes exportées → ${out}`);
