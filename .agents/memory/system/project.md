---
description: Project architecture, patterns, and current status.
---

## Content Playground

**Purpose**: AI-assisted content transformation hub with Human-in-the-loop.
**Status**: POC phase, French-only (`language_code = 'fr'`).

### Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui.
- **Backend**: Supabase (Auth, DB, Storage) - Raw SQL only.
- **AI**: Letta Cloud (orchestration), Vercel Workflows.
- **Monorepo**: Turborepo + pnpm 10.x.

### Core Patterns
- **Markdown Normalization**: Fence length strategy (decreasing lengths by depth) to handle nested directives in BlockNote.
- **Asynchronicity**: Translations reference specific source revisions (`source_revision_id`).
- **Database**: `ingestion_records` -> `editorial_records` -> `publication_records`.

### PR History Insights (Feb 2026)
- High velocity on document lifecycle stability.
- Move towards Server Actions for data mutations.
- Resilience in agent parsing (handling mixed conversational/YAML responses).

---

## 📦 À discuter (Luis + Jérémie + Agent)

### Vercel Workflow Architecture
- `vercel_hook_token` unused: Remove or implement?
- Coupling with Vercel SDK: Risk if provider changes.
- Callback/Polling: Frontend polling vs webhooks for status.
- Race condition: `vercel_workflow_id` storage vs workflow completion.

### Markdown Normalization Strategy (Critical)
- **Problem**: BlockNote flat markdown (:::) vs nested directives.
- **Solution**: Fence length normalization (e.g., Root = 12 colons, Depth 1 = 11, etc.).
- **Files**: `normalizeMarkdown.ts` used in `parser.ts`, `serializer.ts`, and `payload-builder.ts`.

### Workflow & Lifecycle
- **Status**: Defined at `workflow` level, not `editorial_records`.
- **States**: `to_process` | `draft` | `draft_with_source_update` | `published` | `published_with_draft`.
- **Ingestion**: `ingestion_record` (no edito) -> `editorial_record` (on save) -> `publication_record` (on publish/archive).

### Versioning Architecture
- **Scope**: Versions for `editorial_records` and `translation_records`.
- **Logic**: No `parent_id`, use `version` (int) + `based_on_ingestion_id`.
- **Authors**: Creator is `author`; previous authors become `contributors`.

### Metadata Mapping
- Pending implementation in an editor tab.
- Question: Split translatable vs non-translatable metadata?
