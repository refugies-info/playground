# Coding Conventions

Coding style rules to follow across the monorepo, on top of what Biome enforces automatically.

---

## Naming

- **Variables & functions**: `camelCase`.
- **Files & folders**: `kebab-case`, except React components which keep `PascalCase.tsx` (matching the exported component name).
- **Types & interfaces**: `PascalCase` (defined in `@playground/shared-types` when shared, see [Component Strategy](../frontend/component-strategy.md)).
- Prefer a descriptive name that is a bit longer over a short, cryptic one.

## Functional style

- Prefer a functional approach over OOP: use pure functions and immutable data structures, avoid classes (see [AGENTS.md](../../AGENTS.md)).
- Implement objects as little as possible — pass plain data around instead of wrapping it in stateful instances.

## Don't repeat yourself

- Refactor to reuse an existing function instead of copy-pasting.
- Keep the codebase light: don't grow it for no reason, remove what's unused.

## Comments

- Write self-explanatory code first — good code shouldn't need comments to be understood.
- When you do add a comment, keep it short and in **English**, and reserve it for what the code can't say by itself: an exception, a workaround, a non-obvious business rule. Don't restate what the line already shows.

## Language

- Code, types, comments, commit messages: **English**.
- User-facing content stays **French** (`language_code = 'fr'`) — this is content, not UI copy, so there is no i18n system to route it through (see [AGENTS.md](../../AGENTS.md)).

## Components

- Use `shadcn/ui` primitives where possible before building a bespoke component (see [Component Strategy](../frontend/component-strategy.md)).
- Keep components free of business logic where practical: they receive what to display via props, do purely presentational reformatting locally, and leave business rules to callers/hooks/API routes.
- Presentational components (design-system components in `packages/ui`, and generally anything under a `components/` folder) must not fetch or import data themselves — no direct Supabase calls in there. Load data at the page/feature level (or in a hook) and pass it down as props; see [Component Strategy](../frontend/component-strategy.md#keep-design-system-components-stateless).
- Prefer several small, focused components over one large one.

## Data access

- **Reads**: Supabase Client directly from the frontend — but only at the page/feature level (Server Components, route handlers, or hooks called from there), never inside a presentational component (see [Components](#components)). RLS protects these reads.
- **Writes**: API routes using the Service Role Key.
- Don't reach for an ORM — raw SQL or the Supabase Client only.

## Before committing

- `pnpm lint` / `pnpm check:types` / `pnpm test` for what you touched.
- The `pre-push` hook runs `pnpm security:scan:js` (CVE scan, fails on high/critical). Don't disable or route around this script — if it blocks an unrelated change, flag it instead of silencing it.
