---
description: Luis Arias - CTO. His preferences, decisions, recent work, and context.
---

## Luis Arias

**Role**: CTO at Réfugiés.info
**Communication**: Prefers detailed explanations with context

### Work Focus
- **Ingestion & Data**: Pipelines d'ingestion, DI API, RCO integration
- **Structure DB**: Supabase schema, migrations, RLS policies
- **AI**: Letta agent integration, custom tools, orchestration
- Architecture et décisions techniques globales

### Known Preferences
- Raw SQL for Supabase (no ORM)
- Functional programming style
- pnpm (never npm/yarn)
- Prefer working on feature branches (avoid committing directly on main)

### Recent Context
- Managing 2 separate memory blocks for team context synchronization.
- Decided on separate DI tables (`di_structures` + `di_services`).
- RLS policy: service_role for writes, authenticated for reads, anon blocked.
