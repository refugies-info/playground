# sync-dsfr-icons.ts

Script that synchronizes DSFR custom icons missing from Remix Icons.

---

## Summary

Generates React components (`.tsx`) from SVG files in `@gouvfr/dsfr/dist/icons/` that have no equivalent in `@remixicon/react`. Generated components are compatible with the `RemixiconComponentType` type (props: `color`, `size`).

---

## Location

```
packages/ui/scripts/sync-dsfr-icons.ts
```

---

## Running

```bash
# Manual
pnpm --filter @playground/ui sync:icons

# Automatic — runs after every pnpm install
# (configured via "postinstall" in packages/ui/package.json)
```

The script uses `node --experimental-strip-types` (Node 24) to run TypeScript natively, without `tsx` or `ts-node`.

---

## Prerequisites

- `@gouvfr/dsfr` installed (SVG source)
- `@remixicon/react` installed (reference to detect missing icons)

If either is missing, the script prints an error and exits.

---

## What the script does

1. **Scans** all SVGs in `node_modules/@gouvfr/dsfr/dist/icons/` (by category)
2. **Compares** each icon against `@remixicon/react/index.d.ts` exports
3. For each missing icon:
   - Extracts the SVG content
   - Converts SVG attributes to JSX (`fill-rule` → `fillRule`, etc.)
   - Generates a React component in `src/primitives/icon/custom-icons/dsfr/{Name}.tsx`
4. **Generates the barrel** `index.ts` with named exports

---

## Output

```
packages/ui/src/primitives/icon/custom-icons/dsfr/
├── index.ts              # Auto-generated barrel
├── FrErrorFill.tsx
├── FrErrorLine.tsx
├── FrInfoFill.tsx
├── FrInfoLine.tsx
├── FrSuccessFill.tsx
├── FrAccessibilityFill.tsx
└── ...                   # ~45 files total
```

The folder is fully deleted and recreated on each run (idempotent).

---

## Upgrading `@gouvfr/dsfr`

Nothing to do manually. The flow is:

```
pnpm up @gouvfr/dsfr → pnpm install → postinstall → sync-dsfr-icons.ts → files regenerated
```

If new custom icons appear in the upgraded DSFR version, they are automatically detected and generated.

---

## Generated component format

```tsx
// AUTO-GENERATED — do not edit (sync-dsfr-icons.ts)
import type { ComponentType } from "react"

type DsfrIconProps = { color?: string; size?: number | string }

export const FrErrorFill: ComponentType<DsfrIconProps> = ({ color = "currentColor", size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" {...props}>
    <path d="..." />
  </svg>
)
```

---

## Related

- [Icon System](../frontend/icon-system.md) — full documentation
- [DSFR Icons](https://www.systeme-de-design.gouv.fr/fondamentaux/icone/) — official reference
