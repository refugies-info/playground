# 🧠 Refugies.info — Content Playground - an AI-Powered Editorial Workflow

An experimental **AI-assisted content workflow** with a **Human-in-the-Loop** approach, designed to improve the clarity and efficiency of the editorial process at [Refugies.info](https://refugies.info).

---

## 🚀 Overview

This project aims to streamline the publication workflow by combining **AI-driven rewriting** with **human validation**.
It ingests data from multiple sources, automatically sorts and clarifies content using AI, and enables editors to review and approve before export.

### Core Pipeline

```
Ingestion & Import → Quality Gating → Rewrite → Metadata Mapping → Export
```

Each stage is designed to be transparent, auditable, and collaborative — ensuring automation never replaces editorial judgment.

**Key Principle**: Data ingestion is unified (RCO API + config files during POC) with automatic quality gating via AI before editorial work begins.

---

## 🎯 Objectives

- Build a **proof-of-concept (POC)** for an end-to-end editorial pipeline enriched by AI (French-only)
- Test integration between **Letta (AI orchestration)** and **Supabase (data persistence)** with custom tools
- Provide a **Next.js frontend** for human editors to review and validate AI suggestions
- Architect database schema to support future multi-language translation (V2+) without implementation in POC/MVP/V1
- Prepare for future integration with the official Refugies.info publishing systems

---

## 👥 Target Users

- **Editorial team members** at Refugies.info (writers, translators)
- Goal: reduce repetitive editing tasks while keeping full control over content quality and clarity

---

## ⚙️ Tech Stack

| Layer | Tool / Framework | Purpose |
|-------|------------------|----------|
| **Frontend** | [Next.js (App Router)](https://nextjs.org) | User interface for editors |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS framework |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) | Accessible, composable component library |
| **Backend / AI Orchestration** | [Letta Cloud](https://www.letta.com) | Agent-based AI orchestration |
| **Database** | [Supabase](https://supabase.com) | Storage for imported / validated content |
| **AI ↔ DB Bridge** | Letta Custom Tools | Direct Supabase queries via custom Letta tools |
| **Authentication** | [Supabase Auth](https://supabase.com/docs/guides/auth) | User authentication and role-based access control |
| **Language** | TypeScript | Unified across all layers |
| **Monorepo** | [Turborepo](https://turbo.build/repo) | Monorepo package management and task orchestration |
| **Database Queries** | Raw SQL / Supabase Client | Direct Supabase queries (no ORM) |

---

## 🧩 Workflow Description

### 1️⃣ Ingestion & Import
- Ingest data from **RCO API streams** (automated) and **config files** (manual) during POC
- Normalize and store entries in Supabase with full provenance tracking (`source_system`, `source_record_id`, timestamp)
- Support for file uploads and web forms deferred to MVP phase

### 2️⃣ Quality Gating
- Letta classifier agent automatically assesses data quality and completeness
- AI flags items as "accepted" (sufficient quality to proceed) or "rejected" (needs source remediation)
- Editors review AI reasoning, accept/reject flags, and can manually override with justification
- Prevents low-quality data from wasting editorial effort

### 3️⃣ Rewrite
- Letta rewrite agent generates plain-language versions of accepted-flagged content
- Editors review, annotate, and approve or modify results
- Support for multiple rewrite iterations

### 4️⃣ Metadata Mapping
- Editors validate and map document metadata (pricing, dates, public status, related structures)
- Metadata validation is mandatory before publishing
- System tracks which metadata fields were validated/mapped by which editor and when

### 5️⃣ Export
- Export validated content with complete metadata and audit trail back to Supabase or other publishing endpoints
- Prepare integration with Refugies.info data pipelines

---

## 🧱 AI Architecture

- **Letta** handles orchestration, task delegation, and conversational logic with memory management across sessions
- **Custom Letta Tools** provide direct Supabase access for CRUD operations, row-level security, and audit logging
- **Supabase** stores all documents, metadata, validation states, revision history, and audit trails
- Specialized **Letta Agents** include:
  - `classifier-agent` — assesses data quality and flags items as accepted/rejected with reasoning
  - `rewrite-agent` — generates plain-language rewrites of accepted content
  - `validator-agent` — checks structure, completeness, and metadata before export
- **Authentication** handled by Supabase Auth with role-based access control (editor, admin)

All interactions between AI and humans are **logged and auditable** via immutable revision records with full change history, actor attribution, and timestamps.

---

## � Content Lifecycle Management

Beyond the linear workflow stages, editors have flexible control over content publication states:

- **Draft**: Work-in-progress content saved locally, not visible to end users
- **Published**: Content exported to publication database and visible to end users
- **Archived**: Published content hidden from active list but retained in history for reference and recovery

Editors can transition content between states at any point in the workflow:
- Save content as draft at any workflow stage
- Publish when ready (independent of workflow completion)
- Archive outdated content while maintaining full history
- Restore archived content back to published state

State transitions are tracked with editor attribution and timestamp for full audit trail.

---

## �🗄️ Database Schema Design for Multi-Language Support (POC Foundation)

While translation implementation is deferred to MVP2, the database schema is designed during POC to support multi-language content and revision versioning:

- **Language tracking**: All content tables include `language_code` column (default: 'fr' for French source)
- **Translation lineage**: Content and revision tables include `source_revision_id` column to track which source revision a translation is based on
- **Revision language tracking**: `content_revisions` table tracks which language each revision belongs to
- **Uniqueness constraints**: Composite unique constraint on `(content_id, language_code, revision_number)` prevents duplicate revisions per language
- **Query performance**: Indexes on `(language_code, created_at)` for efficient language-specific queries
- **POC constraint**: POC uses `language_code = 'fr'` exclusively; no translation UI or workflows

This design enables seamless scaling to translation workflows in MVP2 without expensive schema migrations.

---

## 🚀 Quick Start: Local Supabase Setup

Get the local development environment running in 3 steps:

```bash
# 1. Start Supabase
supabase start

# 2. Configure environment variables
# Copy .env.example to .env and fill in your actual values
cp .env.example .env

# 3. Access Supabase Studio
# Open http://127.0.0.1:54323 in your browser
```

**Full documentation**: See [documentation/supabase.md](./documentation/supabase.md)

**Service URLs**:
- API: http://127.0.0.1:54321
- Studio: http://127.0.0.1:54323
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

---

## 📚 Documentation

Complete guides and architecture documentation available in the [documentation/](./documentation/) directory:

- **[Supabase Local Development](./documentation/supabase.md)** — Setup, configuration, migrations, troubleshooting
- **[Documentation Index](./documentation/README.md)** — All available guides and resources
- **[Monorepo Structure](./documentation/guides/monorepo-structure.md)** — Project organization and dependencies
- **[Testing Guide](./documentation/guides/testing.md)** — How to run and write tests

---

## 🧭 Development Plan

### Timeline
🗓️ 1 month total — **2 sprints (2 weeks each)**

#### Sprint 1 → Ingestion & Quality Gating
- Implement unified ingestion pipeline (RCO API + config files) with Supabase schema
- Integrate Letta classifier agent for automatic quality assessment and flagging
- Build UI for editors to review AI flags, see reasoning, and manually override
- Implement database schema with language_code and source_revision_id columns

#### Sprint 2 → Rewrite, Metadata Mapping & Export
- Add Letta rewrite agent and collaborative editor interface for content rewriting
- Enable metadata mapping and validation workflow with editor attribution tracking
- Enable export process with complete audit trail and deliver functional end-to-end demo

---

## 🧩 Core User Stories

- **As a system operator**, I can ingest data from RCO API streams and config files so that the editorial team has clean, normalized input data.
- **As an editor**, I can review AI quality assessments and flags so that I can quickly identify which content is ready for editorial work.
- **As an editor**, I can review AI rewrites and accept or modify them so that I can produce clear, accessible content faster.
- **As an editor**, I can discuss content rewrites with an AI chatbot and iteratively refine the output through conversation so that I can achieve the exact tone and clarity I need.
- **As an editor**, I can manage the publication state of content items (draft, published, archived) so that I can control when content becomes visible and manage the lifecycle of published items.
- **As an editor**, I can validate and map document metadata (pricing, dates, public status, related structures) before publishing.
- **As an admin**, I can manage users, assign roles, and control access permissions.
- **As a team lead**, I can monitor progress across all stages (ingestion, quality gating, rewrite, metadata mapping, export) with analytics.

---

## 🎨 Component Architecture

This project follows a **design-system-first approach** with clear separation between reusable design system components and page-specific feature components.

- **Design System** (`/packages/ui`): Centralized, reusable UI primitives and components
- **Feature Components** (`/apps/frontend/src/components`): Page-specific and feature-specific components

For detailed guidelines on component placement, structure, and best practices, see:
- **Quick Reference** (30 seconds): [Component Quick Reference](./documentation/frontend/component-quick-reference.md)
- **Comprehensive Guide**: [Component Strategy](./documentation/frontend/component-strategy.md)

---

## 📚 Documentation Strategy

This project maintains comprehensive documentation organized by **tech stack and project domains**, with clear guidelines for LLMs on creating and maintaining documentation.

**Documentation Structure** (`/documentation`):
- **Frontend** — Next.js, Tailwind CSS, shadcn/ui, component architecture
- **Database** — Supabase, PostgreSQL, migrations, RLS policies
- **AI** — Letta Cloud integration, custom tools, agent workflows
- **Guides** — How-to guides for setup, deployment, development
- **Architecture** — System design, tech stack, monorepo structure
- **Reference** — Quick lookup (commands, environment variables, glossary)
- **Internal** — LLM guidelines and implementation notes
- **Workflows** — Feature-specific processes
- **Troubleshooting** — Common issues and solutions

**Key Rules for LLMs**:
- ✅ Create `.md` files **ONLY** for long-term valuable content
- ✅ **Always ask permission** before creating documentation
- ✅ **Strictly respect** the `/documentation` folder structure
- ❌ No `.md` files at project root or documentation root (except `README.md`)
- ❌ No `/docs` folder (all documentation goes in `/documentation`)

For detailed guidelines on documentation creation, see [**documentation-strategy.md**](./documentation/internal/documentation-strategy.md).

**Start exploring**: [Documentation Index](./documentation/README.md)

---

## 🗺️ Roadmap

| Phase | Milestone | Description |
|--------|------------|-------------|
| **POC** | MVP prototype | Basic end-to-end functionality (French only) | Auth (Sprint 2) |
| **MVP 1** | Improved UX + collaboration | Real-time validation and feedback (French only) |
| **MVP 2** | Integration | Connected to Refugies.info publishing system (French only) |
| **V1** | Production-ready | Comprehensive testing, monitoring, optimization (French only) |
| **V2** | Multi-language support | Translation workflows, revision-based translation, AI translator agent |

### Translation Architecture (V2+)

While POC/MVP/V1 focus on single-language (French) editorial workflows, the system is architected to support multi-language translation:

- **French (fr)** is the source of truth for all content
- **Revision-based translation**: Translators work from specific source revisions, not live content
- **Translator workflows** (V2):
  - View source revision with full context and translation history
  - Create new translation version from specific source revision
  - See what has already been translated for this source revision
  - Access AI-assisted translation suggestions via Letta translator agent
  - Publish translated version for target language independently
- **Letta translator agent** provides iterative translation refinement with context awareness
- **Translation requires explicit approval** (no auto-publish)
- **Translation history** is queryable for analytics and consistency tracking

---

## 🧠 Notes

This project follows the **[Letta Development Guidelines](https://docs.letta.com)** for API, ADE, and MCP integration.
The goal of this POC is to validate the technical chain:

**Import → Sort → Rewrite → Export**
with full **Human-in-the-Loop** control.
