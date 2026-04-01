# Design Tokens — Structural Decisions

Architecture decisions and conventions around design tokens, DSFR, and the Figma → Code relationship.

---

## Architecture: 3-Layer System

The design system uses a 3-layer architecture, from most general to most specific.

```
Layer 1 — Primitives          → raw values (palette, spacing, typography)
Layer 2 — Semantics (optional) → UX role (primary, background, error…)
Layer 3 — Components          → UI role per component (btn-primary-bg…)
```

### Layer 1 — Primitives (DSFR, external)

**We consume, we don't maintain.** Layer 1 is provided by `@gouvfr/dsfr`:

```css
/* globals.css */
@import "@gouvfr/dsfr/dist/core/core.css" layer(dsfr);
```

DSFR exposes its tokens as CSS variables:
```css
--blue-france-sun-113-625: #000091;
--background-default-grey: #f6f6f6;
--error-950-100: #fef4f4;
```

We don't add custom primitives — we reference DSFR variables directly.

### Layer 2 — Semantics (optional, not implemented)

Layer 2 is **not currently in place**. The theoretical role of this layer is to map raw DSFR primitives to business semantic tokens (`--color-status-error`, `--color-action-primary`, etc.).

In practice, `tailwind-theme.css` exists at this level but it is a **compatibility shim**, not a real semantic layer — it only maps DSFR variables to Tailwind/shadcn utility names:

```css
/* tailwind-theme.css — compat shim, not a semantic layer */
@theme inline {
  --color-primary: var(--background-action-high-blue-france);  /* DSFR → Tailwind */
  --color-border:  var(--border-default-grey);
}
```

**⚠️ This file is meant to disappear.** It exists only so that legacy shadcn/ui components (`bg-background`, `bg-muted`, `border-border`) keep working. For every new component → use DSFR variables directly. Never add new tokens here.

A real Layer 2 would only be needed if the project introduces custom semantic tokens that don't exist in DSFR (e.g. project-specific status colors). Until then, Layer 1 (DSFR) connects directly to Layer 3 (CVA).

### Layer 3 — Components (CVA inside the component)

Layer 3 lives in CVA, not in a separate CSS file. **YAGNI principle**: only create a component CSS file if multiple components share the same tokens.

```tsx
// Button.tsx — CVA = Layer 3
const buttonVariants = cva("...", {
  variants: {
    variant: {
      primaire:   "bg-[var(--background-action-high-blue-france)] text-[var(--text-inverted-grey)]",
      secondaire: "bg-transparent border border-[var(--border-action-high-blue-france)]",
    },
  },
})
```

---

## Relationship with DSFR

### Positioning

DSFR is used as a **token source** (Layer 1), not as an integrated framework.

**We don't:**
- `import "@gouvfr/dsfr"` for JS components
- Use DSFR classes (`fr-btn`, `fr-icon-*`) on our React components
- Depend on DSFR JavaScript

**We do:**
- Import `@gouvfr/dsfr/dist/core/core.css` for CSS tokens
- Reference DSFR CSS variables in CVA and components
- Follow DSFR specs (sizes, states, accessibility)

### Why this approach?

DSFR audit conducted — score **6/10**:

| Aspect | Score | Issue |
|--------|-------|-------|
| Documentation | 9/10 | — |
| Technical architecture | 4/10 | Mixes Layer 1/2/3 |
| Naming | ❌ | Color in the name (`$background-active-blue-france`) |
| Modularity | ❌ | Non-modular SCSS |

**"Shortcut Fatal" pattern identified:** when the right token can't be found in < 30 seconds, developers use Layer 1 primitives or hardcoded values directly. DSFR's complexity pushes people to bypass the system.

Our approach: isolate the value (DSFR CSS variables), name our components with understandable business vocabulary.

### Figma ↔ DSFR ↔ Code alignment

Julie and Margot (designers) use the **DSFR Design Kit** in Figma. Colors extracted from Figma directly map to DSFR tokens:

| Figma Badge | DSFR Variable | Value |
|-------------|---------------|-------|
| Validated (bg) | `--success-950-100` | #b8fec9 |
| Refused (bg) | `--error-950-100` | #ffe9e9 |
| Pending | `--yellow-moutarde-925-125-hover` | #f6c43c |
| Conform AI | `--info-950-100` | #e8edff |

The pipeline is: **Figma (DSFR Design Kit) → DSFR variables → CVA**.

---

## Variant naming

### Principle: mirroring Figma, in French

Variant names are **in French**, aligned with the vocabulary used in Figma by the designers. Goal: zero mental translation between Figma and code.

### Button

| Figma name | Code variant |
|-----------|-------------|
| CTA Primaires / Mode clair | `primaire` |
| CTA Secondaires / Mode clair | `secondaire` |
| CTA Primaires / Mode coloré | `primaire-colore` |
| CTA Secondaires / Mode coloré | `secondaire-colore` |
| CTA Tertiaires | `tertiaire` |
| CTA Quatrième | `quatrieme` |
| CTA Violet | `violet` |

```tsx
// ✅ Correct
<Button variant="primaire">Continuer</Button>
<Button variant="secondaire">Annuler</Button>

// ❌ Wrong — old shadcn/ui English names
<Button variant="primary">Continuer</Button>
<Button variant="ghost">Annuler</Button>
```

### Badge

Two variant families:

**RCO Validation** (light background, colored text — DSFR variables):

| Variant | Usage | Color |
|---------|-------|-------|
| `validated` | Validated record | Green (`--success-*`) |
| `refused` | Refused record | Red (`--error-*`) |
| `conform-ai` | AI-compliant | Blue (`--info-*`) |
| `doublon` | Duplicate detected | Orange (`--warning-*`) |

**Workflow status** (solid background, white text):

| Variant | Usage |
|---------|-------|
| `pending` | Pending |
| `draft` | Draft |
| `archived` | Archived |
| `published` | Published |
| `review` | Under review |

**Generic** (backwards compatibility): `info`, `neutral`, `success`, `danger`, `warning`.

---

## CSS Layer management

**Problem:** DSFR `hover` rules (`button:hover { background-color: ... }`) were overriding Tailwind utilities because DSFR and Tailwind were at the same specificity level.

**Solution:** declare layer order **before** importing Tailwind.

```css
/* globals.css — order matters */
@layer dsfr, base, components, utilities;  /* dsfr = lowest priority */

@import "tailwindcss";
@import "@gouvfr/dsfr/dist/core/core.css" layer(dsfr);  /* DSFR isolated */
```

Tailwind utilities always win, even when DSFR applies behavioral rules on `:hover`.

---

## Rules to remember

| Rule | Reason |
|------|--------|
| Reference DSFR vars directly in CVA | Consistency with Figma, no intermediate token |
| Never add to `tailwind-theme.css` | This file is being phased out |
| Variant names in French | Aligned with designers' Figma vocabulary |
| No DSFR classes (`fr-btn`, `fr-icon-*`) | We consume tokens, not DSFR components |
| Layer 3 in CVA, not in a CSS file | YAGNI — CSS file only if tokens are shared |

---

## Key files

| File | Role |
|------|------|
| `packages/ui/src/styles/globals.css` | CSS entry point, layer declaration |
| `packages/ui/src/styles/tailwind-theme.css` | shadcn/ui → DSFR compat (being phased out) |
| `node_modules/@gouvfr/dsfr/dist/core/core.css` | Layer 1 — DSFR variables (primitives + semantics) |
| `packages/ui/src/primitives/button/Button.tsx` | Layer 3 via CVA example |
| `packages/ui/src/primitives/badge/Badge.tsx` | Business semantic tokens via CVA example |

---

## Related

- [Icon System](./icon-system.md) — DSFR and Remix Icons
- [Component Strategy](./component-strategy.md) — component organization
- [DSFR Fondamentaux](https://www.systeme-de-design.gouv.fr/fondamentaux/) — official reference
