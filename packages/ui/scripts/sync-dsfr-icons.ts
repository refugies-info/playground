#!/usr/bin/env node

/**
 * sync-dsfr-icons.ts
 *
 * Scanne les SVGs custom DSFR (absents de @remixicon/react)
 * et genere un composant React par icone + barrel d'export.
 *
 * Sortie :
 *   src/primitives/icon/custom-icons/dsfr/
 *     FrErrorFill.tsx
 *     FrInfoLine.tsx
 *     ...
 *     index.ts          <- barrel
 *
 * Usage :
 *   pnpm --filter @playground/ui sync:icons
 */

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../../..");
const DSFR_ICONS = resolve(ROOT, "node_modules/@gouvfr/dsfr/dist/icons");
const RI_TYPES = resolve(ROOT, "node_modules/@remixicon/react/index.d.ts");
const OUT_DIR = resolve(__dirname, "../src/primitives/icon/custom-icons/dsfr");

// -- Helpers ------------------------------------------------------------------

const toPascal = (kebab: string): string =>
  kebab
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");

/** Kebab SVG attrs -> camelCase JSX attrs */
const SVG_ATTR_MAP: Record<string, string> = {
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "fill-opacity": "fillOpacity",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "text-anchor": "textAnchor",
  "dominant-baseline": "dominantBaseline",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
};

const toJsxAttrs = (svgContent: string): string => {
  let result = svgContent;
  for (const [attr, jsx] of Object.entries(SVG_ATTR_MAP)) {
    result = result.replaceAll(attr, jsx);
  }
  return result;
};

interface IconEntry {
  base: string;
  category: string;
  svg: string;
}

// -- Checks -------------------------------------------------------------------

if (!existsSync(DSFR_ICONS)) {
  process.exit(1);
}

if (!existsSync(RI_TYPES)) {
  process.exit(1);
}

// -- Collect missing icons ----------------------------------------------------

const riIndex = readFileSync(RI_TYPES, "utf8");
const missing: IconEntry[] = [];

for (const cat of readdirSync(DSFR_ICONS, { withFileTypes: true }).filter((d) =>
  d.isDirectory(),
)) {
  for (const file of readdirSync(`${DSFR_ICONS}/${cat.name}`).filter((f) =>
    f.endsWith(".svg"),
  )) {
    const base = file.replace(".svg", "");
    const riName = `Ri${toPascal(base)}`;

    if (!riIndex.includes(riName)) {
      const svg = readFileSync(`${DSFR_ICONS}/${cat.name}/${file}`, "utf8");
      missing.push({ base, category: cat.name, svg });
    }
  }
}

missing.sort((a, b) => a.base.localeCompare(b.base));

// -- Clean & recreate output dir ----------------------------------------------

if (existsSync(OUT_DIR)) {
  rmSync(OUT_DIR, { recursive: true });
}
mkdirSync(OUT_DIR, { recursive: true });

// -- Generate one file per icon -----------------------------------------------

const dsfrVersion: string = JSON.parse(
  readFileSync(resolve(ROOT, "node_modules/@gouvfr/dsfr/package.json"), "utf8"),
).version;

const exports: string[] = [];

for (const { base, svg } of missing) {
  const name = toPascal(base);
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 24 24";

  let inner = svg
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>/, "")
    .trim();
  inner = toJsxAttrs(inner);

  const content = [
    `// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)`,
    `import type { ComponentType } from "react"`,
    ``,
    `type DsfrIconProps = { color?: string; size?: number | string }`,
    ``,
    `export const ${name}: ComponentType<DsfrIconProps> = ({ color = "currentColor", size = 24, ...props }) => (`,
    `  <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width={size} height={size} fill={color} aria-hidden="true" {...props}>`,
    `    ${inner}`,
    `  </svg>`,
    `)`,
    ``,
  ].join("\n");

  writeFileSync(resolve(OUT_DIR, `${name}.tsx`), content);
  exports.push(name);
}

// -- Generate barrel ----------------------------------------------------------

const barrel = [
  `/**`,
  ` * Icones custom DSFR — absentes de @remixicon/react`,
  ` *`,
  ` * AUTO-GENERE par scripts/sync-dsfr-icons.ts`,
  ` * Ne pas editer a la main.`,
  ` *`,
  ` * Source : @gouvfr/dsfr ${dsfrVersion}`,
  ` * ${exports.length} icones custom`,
  ` */`,
  ``,
  ...exports.map((name) => `export { ${name} } from "./${name}"`),
  ``,
].join("\n");

writeFileSync(resolve(OUT_DIR, "index.ts"), barrel);

// -- Format with Biome --------------------------------------------------------

try {
  execSync(`pnpm biome check --write "${OUT_DIR}"`, {
    cwd: ROOT,
    stdio: "pipe",
  });
} catch {
  // Biome not available or check failed — not critical
}
