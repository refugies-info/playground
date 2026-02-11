---
description: Behavioral rules and coding standards for agents.
---

## Behavioral Rules

### Coding Style
- **Functional over OOP**: Avoid classes, use pure functions and immutable data.
- **Raw SQL**: Use the Supabase client or raw SQL; never use an ORM.
- **Types**: Import from `@playground/shared-types`.
- **Styling**: Tailwind CSS + shadcn/ui.

### Documentation & Git
- **Permission First**: Ask before creating `.md` files.
- **Location**: All long-term docs go in `/documentation`.
- **Commits**: Conventional commits (`feat:`, `fix:`, etc.).
- **Branching**: `luis/ri-XXXX-description` or `jeremie/feature-name`.

### Package Management
- **Strict pnpm**: Never use npm or yarn.
- **Command**: `pnpm add <pkg> --filter <workspace>`.
