# Documentation

Comprehensive documentation for the Content Playground project, organized by tech stack and project domains.

---

## 🚀 Quick Start

**New to the project?** Start here:

1. [Local Development Setup](./guides/local-development.md) — Get running in 5 minutes
2. [Component Architecture](./frontend/component-quick-reference.md) — 30-second overview
3. [Common Commands](./reference/commands.md) — Useful CLI commands

---

## 📚 Guides

Step-by-step guides for common tasks:

- **[Local Development Setup](./guides/local-development.md)** — Set up your development environment
- **[Supabase Setup](./guides/supabase-setup.md)** — Configure Supabase locally and in production
- **[Deployment](./guides/deployment.md)** — Deploy to Vercel, Supabase, and Letta Cloud

---

## 🏗️ Architecture

System design and technical decisions:

- **[Tech Stack](./architecture/tech-stack.md)** — Technology choices and rationale
- **[Monorepo Structure](./architecture/monorepo-structure.md)** — Turborepo organization
- **[Database Schema](./architecture/database-schema.md)** — Data model and migrations
- **[Authentication](./architecture/authentication.md)** — Auth flow and security

---

## � Frontend

Next.js + Tailwind CSS + shadcn/ui documentation:

- **[Frontend Overview](./frontend/README.md)** — Frontend documentation index
- **[Component Strategy](./frontend/component-strategy.md)** — Component architecture and organization
- **[Component Quick Reference](./frontend/component-quick-reference.md)** — 30-second component overview
- **[Styling Guide](./frontend/styling-guide.md)** — Tailwind CSS v4 + shadcn/ui patterns (coming soon)

---

## 🗄️ Database

Supabase + PostgreSQL documentation:

- **[Database Overview](./database/README.md)** — Database documentation index
- **[Seed Data Setup](./database/seed-data.md)** — Test users for local development
- **[Migrations](./database/migrations.md)** — Migration strategy and patterns (coming soon)
- **[RLS Policies](./database/rls-policies.md)** — Row-level security implementation (coming soon)
- **[Query Patterns](./database/query-patterns.md)** — SQL patterns and best practices (coming soon)

---

## 🤖 AI

Letta Cloud integration documentation:

- **[AI Overview](./ai/README.md)** — AI documentation index
- **[Letta Integration](./ai/letta-integration.md)** — Letta setup and custom tools (coming soon)
- **[Agent Workflows](./ai/agent-workflows.md)** — Agent definitions and orchestration (coming soon)
- **[Tool Development](./ai/tool-development.md)** — Creating custom Letta tools (coming soon)

---

## 🧬 Migration agent IA (Letta Code SDK + qmd)

Project-specific documentation for the migration of the editorial AI agent from Letta Cloud to Letta Code SDK + qmd corpus. Tracked under Linear project [Migration agent IA — Letta Code SDK et qmd](https://linear.app/refugies-info/project/migration-agent-ia-letta-code-sdk-et-qmd-458608ee4f70).

- **[Agent Migration Overview](./agent-migration/README.md)** — Project index, RI/PR mapping, scoping decision (15 June 2026)
- **[Letta Cloud Inventory](./agent-migration/letta-cloud-inventory.md)** — Full inventory of the current Letta Cloud agent (prompts, memory blocks, custom tools, agent IDs, integration points) — _RI-1258 / PR 01_

---

## 🔄 Workflows

Feature-specific workflows and processes:

- **[Editorial Workflow](./workflows/editorial-workflow.md)** — Content editing process
- **[Quality Gating](./workflows/quality-gating.md)** — AI quality assessment
- **[Metadata Mapping](./workflows/metadata-mapping.md)** — Metadata validation

---

## 🛠️ Reference

Quick lookup materials:

- **[Environment Variables](./reference/environment-variables.md)** — Configuration reference
- **[Common Commands](./reference/commands.md)** — CLI commands and aliases
- **[Glossary](./reference/glossary.md)** — Project terminology

---

## 📜 Scripts

One-off and utility scripts:

- **[Scripts Overview](./scripts/README.md)** — Full index of all available scripts
- **[Force Metadata Reports](./scripts/force-metadata-reports.md)** — Regenerate AI metadata reports

---

## 🔒 Internal

Internal guidelines and implementation notes:

- **[Documentation Strategy](./internal/documentation-strategy.md)** — Guidelines for LLMs on creating documentation
- **[Component Strategy Implementation](./internal/component-strategy-implementation.md)** — Implementation notes

---

## 🐛 Troubleshooting

Solutions for common issues:

- **[Supabase Issues](./troubleshooting/supabase-issues.md)** — Database and auth problems
- **[Component Issues](./troubleshooting/component-issues.md)** — UI component problems
- **[Build Issues](./troubleshooting/build-issues.md)** — Build and deployment issues

---

## 🗺️ Roadmap

Project roadmap and milestones:

- **[MVP Roadmap](./roadmaps/roadmap-mvp.md)** — MVP phase priorities and timeline

---

## 📖 Related Documentation

- **[Project README](../README.md)** — Project overview and objectives
- **[Component Strategy](../docs/COMPONENT_STRATEGY.md)** — Comprehensive component guide
- **[Component Quick Reference](../docs/COMPONENT_QUICK_REFERENCE.md)** — 30-second overview
- **[Implementation Summary](../docs/COMPONENT_STRATEGY_IMPLEMENTATION.md)** — What was done

---

## 🔗 Quick Links

| Resource | Location |
|----------|----------|
| Frontend App | [apps/frontend](../apps/frontend) |
| Design System | [packages/ui](../packages/ui) |
| Shared Types | [packages/shared](../packages/shared) |
| Supabase Config | [supabase/](../supabase) |
| Database Migrations | [migrations/](../migrations) |
| Feature Specs | [specs/](../specs) |

---

## 💡 Tips

- **Search the docs** — Use Ctrl+F to find what you need
- **Check the guides first** — Most questions are answered in guides/
- **Reference section** — Quick lookup for commands, variables, terminology
- **Troubleshooting** — Common issues and solutions

---

## 📝 Contributing

When adding documentation:

1. Choose the appropriate folder (guides/, architecture/, etc.)
2. Use clear, concise language
3. Include examples where helpful
4. Link to related documentation
5. Update this README with new entries

---

## 📞 Support

- Check [Troubleshooting](./troubleshooting/) for common issues
- See [Common Commands](./reference/commands.md) for CLI help
- Review [Glossary](./reference/glossary.md) for terminology
- Check project [README.md](../README.md) for overview
