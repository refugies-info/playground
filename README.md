# 🧠 Refugies.info — Content Playground - an AI-Powered Editorial Workflow

An experimental **AI-assisted content workflow** with a **Human-in-the-Loop** approach, designed to improve the clarity and efficiency of the editorial process at [Refugies.info](https://refugies.info).

---

## 🚀 Overview

This project aims to streamline the publication workflow by combining **AI-driven rewriting** with **human validation**.  
It ingests data from multiple sources, automatically sorts and clarifies content using AI, and enables editors to review and approve before export.

### Core Pipeline

```
Import → Sort → Re-write → Metadata Mapping → Export
```

Each stage is designed to be transparent, auditable, and collaborative — ensuring automation never replaces editorial judgment.

---

## 🎯 Objectives

- Build a **proof-of-concept (POC)** for an end-to-end editorial pipeline enriched by AI (French-only)
- Test integration between **Letta (AI orchestration)** and **Supabase (data persistence)** with custom tools
- Provide a **Next.js frontend** for human editors to review and validate AI suggestions
- Architect database schema to support future multi-language translation (V2+) without implementation in POC/MVP/V1
- Prepare for future integration with the official Refugies.info publishing systems

---

## 👥 Target Users

- **Editorial team members** at Refugies.info (writers, translators, reviewers)  
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

### 1️⃣ Import
- Ingest data from APIs, JSON, or CSV files  
- Normalize and store entries in Supabase

### 2️⃣ Sort
- AI-based classification, quality scoring, and tagging of imported items  
- Human review of suggested topics and categories

### 3️⃣ Re-write
- Letta agents rewrite content for clarity and readability  
- Editors review, annotate, and approve or modify results

### 4️⃣ Metadata Mapping
- Editors validate and map document metadata (pricing, dates, public status, related structures)  
- Metadata validation is mandatory before publishing  
- System tracks which metadata fields were validated/mapped by which editor and when

### 5️⃣ Export
- Export validated content with complete metadata back to Supabase or other publishing endpoints  
- Prepare integration with Refugies.info data pipelines

---

## 🧱 AI Architecture

- **Letta** handles orchestration, task delegation, and conversational logic  
- **Custom Letta Tools** provide direct Supabase access for CRUD operations, row-level security, and audit logging  
- **Supabase** stores all documents, metadata, validation states, and revision history  
- Specialized **Letta Agents** include:  
  - `clarifier-agent` — rewrites content for readability  
  - `classifier-agent` — sorts and tags imported data  
  - `validator-agent` — checks structure and quality  
- **Authentication** handled by Supabase Auth with role-based access control (editor, reviewer, admin)

All interactions between AI and humans are **logged and auditable** via immutable revision records.

---

## 🧭 Development Plan

### Timeline
🗓️ 1 month total — **2 sprints (2 weeks each)**

#### Sprint 1 → Import & Sort
- Implement import pipeline and Supabase schema  
- Integrate Letta classification logic via custom tools  
- Build initial UI for data review and validation  

#### Sprint 2 → Re-write, Metadata Mapping & Export
- Add rewriting agent and collaborative editor interface  
- Enable metadata mapping and validation workflow  
- Enable export process and deliver functional end-to-end demo  

---

## 🧩 Core User Stories

- **As a content manager**, I can import data files so that the editorial team can process them.  
- **As an editor**, I can view AI-sorted data to focus on relevant content.  
- **As an editor**, I can review AI rewrites and accept or modify them.  
- **As an editor**, I can validate and map document metadata (pricing, dates, public status, related structures) before publishing.
- **As a reviewer**, I can approve and export validated versions with complete metadata for publication.  
- **As a team lead**, I can monitor progress across all stages (import, sort, rewrite, metadata mapping, export).

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
