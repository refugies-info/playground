#!/usr/bin/env npx ts-node
/**
 * Colorise la carte SVG des départements français via un bloc <style> CSS.
 * Avantage CSS : pas besoin de toucher aux éléments SVG un par un —
 * les sélecteurs d'attribut [id="dpt-XX"] overrident les fill= de présentation.
 *
 * Source SVG  : map-departements.svg
 * Source data : map-departement-data.json
 * Output      : map-departements-colored.svg
 *
 * Cas spéciaux gérés :
 *   - dpt-17  × 3 → renommés dpt-17, dpt-17-b, dpt-17-c  (îles de Ré/Oléron)
 *   - dpt-976 × 2 → renommés dpt-976, dpt-976-b           (Mayotte)
 *   - dpt-75-92-93-94 → zoom "Paris petite couronne"       (coloré comme 75)
 *   - dpt-09, dpt-11 → dans le SVG, absents des données   → gris
 *   - code 978       → dans les données, absent du SVG    → ignoré
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeptData {
  departement: string;
  nb_services: number;
}

interface ColorLevel {
  min: number;
  color: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Palette DSFR — gris (peu) → bleu (moyen) → orange (fort)
// Tokens officiels : grey-975/925, blue-france-850/main-525/sun-113, orange-terre-battue-main/sun
// ---------------------------------------------------------------------------

const COLOR_LEVELS: ColorLevel[] = [
  { min: 500, color: "#000091", label: "500+" }, // blue-france-sun-113   (IDF)
  { min: 226, color: "#313178", label: "226–499" }, // blue-france-850 dark  (PACA)
  { min: 155, color: "#6a6af4", label: "155–225" }, // blue-france-main-525  (Auvergne-RA, Grand Est)
  { min: 100, color: "#cacafb", label: "100–154" }, // blue-france-850       (Centre-VdL, Nouvelle-Aquitaine…)
  { min: 83, color: "#e3e3fd", label: "83–99" }, // blue-france-925       (Bretagne, Pays-de-la-Loire)
  { min: 36, color: "#cecece", label: "36–82" }, // grey-200              (Normandie, Hauts-de-France)
  { min: 6, color: "#e5e5e5", label: "6–35" }, // grey-925              (Corse, Guyane, Mayotte)
  { min: 1, color: "#f6f6f6", label: "1–5" }, // grey-975              (Occitanie petits, DOM-TOM)
];

const COLOR_NO_DATA = "#e0e0e0"; // gris neutre (09, 11 — absents des données)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getColor(nb: number): string {
  for (const level of COLOR_LEVELS) {
    if (nb >= level.min) return level.color;
  }
  return COLOR_NO_DATA;
}

/**
 * Renomme la N-ième occurrence d'un id dans le SVG.
 * Utilisé pour dédupliquer dpt-17 (×3) et dpt-976 (×2).
 */
function renameNthOccurrence(
  svg: string,
  originalId: string,
  n: number,
  newId: string,
): string {
  let count = 0;
  return svg.replace(new RegExp(`id="${originalId}"`, "g"), (match) => {
    count++;
    return count === n ? `id="${newId}"` : match;
  });
}

/**
 * Applique un fill inline sur toutes les lignes contenant id="dpt-CODE".
 * Figma ne lit que les attributs de présentation SVG, pas les blocs <style>.
 *
 * Stratégie ligne par ligne :
 *   1. Supprimer les fill="..." existants sur la ligne (évite les doublons)
 *   2. Injecter fill="COLOR" juste après id="dpt-CODE"
 */
function applyInlineFills(
  svg: string,
  colorMap: Map<string, string>, // svgCode (sans "dpt-") → color
): string {
  return svg
    .split("\n")
    .map((line) => {
      const match = line.match(/id="dpt-([^"]+)"/);
      if (!match) return line;

      const code = match[1];
      const color = colorMap.get(code);
      if (!color) return line;

      // 1. Supprimer tous les fill="..." existants (mais pas fill-rule)
      line = line.replace(/\bfill="[^"]*"/g, "");

      // 2. Ajouter fill="COLOR" juste après id="dpt-CODE"
      line = line.replace(
        `id="dpt-${code}"`,
        `id="dpt-${code}" fill="${color}"`,
      );

      return line;
    })
    .join("\n");
}

/**
 * Construit la légende SVG (éléments inline avec fill= — ce sont des décorations fixes).
 */
function buildLegend(): string {
  const x = 480;
  const yTitle = 17;
  const yStart = 28;
  const rectW = 18;
  const rectH = 14;
  const spacing = 20;

  // Les items, du plus fort au plus faible (ordre naturel de COLOR_LEVELS)
  const items = [
    ...COLOR_LEVELS.map((l) => ({
      label: l.label,
      color: l.color,
      isLight: false,
    })),
    { label: "N/A", color: COLOR_NO_DATA, isLight: true },
  ];

  // Couleurs "claires" qui ont besoin d'une bordure visible
  const LIGHT_COLORS = new Set([
    "#f6f6f6",
    "#e5e5e5",
    "#cecece",
    "#cacafb",
    "#e0e0e0",
  ]);

  const rows = items
    .map((item, i) => {
      const y = yStart + i * spacing;
      const isLight = LIGHT_COLORS.has(item.color);
      const stroke = isLight ? "#aaaaaa" : item.color;
      const strokeWidth = isLight ? "1" : "0.5";
      // Séparateur entre les blocs gris et bleu (après "11–49")
      const sep =
        item.label === "83–99"
          ? `  <line x1="${x}" y1="${y - 5}" x2="${x + rectW + 60}" y2="${y - 5}" stroke="#dddddd" stroke-width="0.5" stroke-dasharray="3,2"/>\n`
          : "";
      return [
        sep,
        `  <rect x="${x}" y="${y}" width="${rectW}" height="${rectH}" fill="${item.color}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="2"/>`,
        `  <text x="${x + rectW + 6}" y="${y + 10}" font-family="system-ui, sans-serif" font-size="10" fill="#3a3a3a">${item.label}</text>`,
      ].join("\n");
    })
    .join("\n");

  return [
    `<g id="legend-data">`,
    `  <text x="${x}" y="${yTitle}" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#3a3a3a">Nb services</text>`,
    rows,
    `</g>`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const root = __dirname; // fichiers source dans le même dossier

// Lecture
let svg = readFileSync(join(root, "map-departements.svg"), "utf-8");
const data: DeptData[] = JSON.parse(
  readFileSync(join(root, "map-departement-data.json"), "utf-8"),
);

const servicesByDept = new Map<string, number>(
  data.map((d) => [d.departement, d.nb_services]),
);

// ---------------------------------------------------------------------------
// 1. Fixer les IDs en doublon
// ---------------------------------------------------------------------------

console.log("🔧 Correction des IDs en doublon...");

// dpt-17 : 3 occurrences → renommer la 2e, puis la nouvelle 2e (qui était la 3e)
svg = renameNthOccurrence(svg, "dpt-17", 2, "dpt-17-b");
svg = renameNthOccurrence(svg, "dpt-17", 2, "dpt-17-c"); // après renommage, la 3e est devenue la 2e

// dpt-976 : 2 occurrences → renommer la 2e
svg = renameNthOccurrence(svg, "dpt-976", 2, "dpt-976-b");

console.log("   ✅ dpt-17 → dpt-17, dpt-17-b, dpt-17-c");
console.log("   ✅ dpt-976 → dpt-976, dpt-976-b");

// ---------------------------------------------------------------------------
// 2. Extraire tous les codes SVG uniques après renommage
// ---------------------------------------------------------------------------

const svgIds = [
  ...new Set([...svg.matchAll(/id="dpt-([^"]+)"/g)].map((m) => m[1])),
];

console.log(`\n🗺️  ${svgIds.length} codes uniques dans le SVG`);

// ---------------------------------------------------------------------------
// 3. Construire la map svgCode → color
// ---------------------------------------------------------------------------

// svgCode (sans "dpt-") → color
const colorMap = new Map<string, string>();

for (const svgId of svgIds) {
  // Cas spéciaux : résoudre vers le bon code de données
  const dataKey =
    svgId === "75-92-93-94"
      ? "75" // zoom Paris petite couronne
      : svgId === "17-b" || svgId === "17-c"
        ? "17" // îles de Ré/Oléron
        : svgId === "976-b"
          ? "976" // Mayotte (2e île)
          : svgId;

  const nb = servicesByDept.get(dataKey);
  const color = nb !== undefined ? getColor(nb) : COLOR_NO_DATA;

  colorMap.set(svgId, color);

  const label =
    nb !== undefined
      ? `${nb} services → ${color}`
      : `pas de données → ${color}`;
  console.log(`  ${nb !== undefined ? "✅" : "⬜"} dpt-${svgId}: ${label}`);
}

// ---------------------------------------------------------------------------
// 4. Appliquer les fills inline (compatible Figma)
// ---------------------------------------------------------------------------

// Ajouter xmlns si absent (requis pour rendu correct dans Chrome via file://)
if (!svg.includes("xmlns=")) {
  svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
}

svg = applyInlineFills(svg, colorMap);

// Épaissir les contours des départements
svg = svg.replace(/stroke-width="0\.4"/g, 'stroke-width="1"');

// ---------------------------------------------------------------------------
// 5. Insérer la légende
// ---------------------------------------------------------------------------

const legend = buildLegend();
svg = svg.replace(
  `<g id="carte" transform="translate(12.000000, 2.000000)"`,
  `${legend}\n            <g id="carte" transform="translate(12.000000, 2.000000)"`,
);

// ---------------------------------------------------------------------------
// 6. Écrire le fichier de sortie
// ---------------------------------------------------------------------------

const outputPath = join(root, "map-departements-colored.svg");
writeFileSync(outputPath, svg, "utf-8");

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const values = [...servicesByDept.values()];
const noDataCount = [...colorMap.values()].filter(
  (c) => c === COLOR_NO_DATA,
).length;
const coloredCount = svgIds.length - noDataCount;

console.log(`\n✅ Carte générée : ${outputPath}`);
console.log(
  `   ${coloredCount} départements colorés, ${noDataCount} sans données (gris)`,
);
console.log(`\n📊 Distribution par plage :`);

for (let i = 0; i < COLOR_LEVELS.length; i++) {
  const level = COLOR_LEVELS[i];
  const nextMin = i > 0 ? COLOR_LEVELS[i - 1].min : Infinity;
  const count = data.filter(
    (d) => d.nb_services >= level.min && d.nb_services < nextMin,
  ).length;
  console.log(
    `   ${level.label.padEnd(10)} ${level.color}  →  ${count} depts dans les données`,
  );
}

console.log(
  `\n📊 Valeurs : min=${Math.min(...values)}, max=${Math.max(...values)}`,
);
