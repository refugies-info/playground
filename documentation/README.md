# Documentation

Index of the Content Playground documentation. Every link below points to a file that exists; `pnpm validate:docs` checks it.

---

## 🚀 Quick Start

1. [Local Development Setup](./guides/local-development.md) — Get running locally
2. [Coding Conventions](./guides/coding-conventions.md) — Naming, comments, functional style
3. Commands: see the `scripts` of the root [package.json](../package.json)

---

## 📚 Guides

- **[Local Development Setup](./guides/local-development.md)** — Set up your development environment
- **[Coding Conventions](./guides/coding-conventions.md)** — Code style rules
- **[Testing](./guides/testing.md)** — Testing practices
- **[Worktrees](./guides/worktrees.md)** — Working with git worktrees

---

## 🏗️ Architecture

- **[Tech Stack](./architecture/tech-stack.md)** — Technology choices, rationale and deployment
- **[Content Pipeline](./architecture/content-pipeline.md)** — Markdown content pipeline
- **[Document Editor Contexts](./architecture/document-editor-contexts.md)** — Editor contexts and routes
- **[H1 Title Flow](./architecture/h1-title-flow.md)** — H1 title handling
- **[Metadata Validation Strategy](./architecture/metadata-validation-strategy.md)** — ADR, 3-layer metadata validation

---

## 🎨 Frontend

- **[Design Tokens](./frontend/design-tokens.md)** — Structural decisions on tokens
- **[Icon System](./frontend/icon-system.md)** — Icons
- **[Publication & Archive](./frontend/publication/index.md)** — Preview, publish, archive, translation preview

---

## 🗄️ Database

- **[Migrations](./database/migrations.md)** — Migration strategy and best practices
- **[RLS Policies](./database/rls-policies.md)** — Row-level security
- **[Seed Data](./database/seed-data.md)** — Test users for local development
- **[Remote Dump](./database/remote-dump.md)** — Dump a remote Supabase DB locally

---

## 🤖 AI

- **[Local Letta Dev](./ai/local-letta-dev.md)** — Self-hosted Letta for local development

### Agent migration (Letta Cloud → Letta Agent SDK)

Tracked under the Linear project [Migration agent IA — Letta Code SDK et qmd](https://linear.app/refugies-info/project/migration-agent-ia-letta-code-sdk-et-qmd-458608ee4f70).

- **[Agent Migration Overview](./agent-migration/README.md)** — Project index, decisions, delivery plan
- **[Letta Cloud Inventory](./agent-migration/letta-cloud-inventory.md)** — Prompts, memory blocks, custom tools, agent IDs

---

## 🔄 Workflows

- **[DI Ingestion](./workflows/di-ingestion.md)** — Data Inclusion ingestion workflow
- **[Metadata Mapping](./workflows/metadata-mapping.md)** — Metadata validation
- **[Translation Publication](./workflows/translation-publication.md)** — Translation publication flow

---

## 🛠️ Reference

- **[Environment Variables](./reference/environment-variables.md)** — Configuration reference

---

## 📜 Scripts

- **[Scripts Overview](./scripts/README.md)** — Index of all scripts
- **[Force Metadata Reports](./scripts/force-metadata-reports.md)** — Regenerate AI metadata reports
- **[Sync DSFR Icons](./scripts/sync-dsfr-icons.md)** — Icon sync script

---

## 🔗 Quick Links

| Resource | Location |
|----------|----------|
| Project README | [README.md](../README.md) |
| Agent instructions | [AGENTS.md](../AGENTS.md) |
| Frontend App | [apps/frontend](../apps/frontend) |
| Design System | [packages/ui](../packages/ui) |
| Shared Types | [packages/shared](../packages/shared) |
| Supabase Config & Migrations | [supabase/](../supabase) |

---

## 📝 Contributing

1. Pick the matching folder (guides/, architecture/, …).
2. Link to related documentation with relative links.
3. Add the new file to this index.
4. Run `pnpm validate:docs` to check links.
