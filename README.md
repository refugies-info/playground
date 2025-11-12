# 🧠 Refugies.info — Content Playground - an AI-Powered Editorial Workflow

An experimental **AI-assisted content workflow** with a **Human-in-the-Loop** approach, designed to improve the clarity and efficiency of the editorial process at [Refugies.info](https://refugies.info).

---

## 🚀 Overview

This project aims to streamline the publication workflow by combining **AI-driven rewriting** with **human validation**.  
It ingests data from multiple sources, automatically sorts and clarifies content using AI, and enables editors to review and approve before export.

### Core Pipeline

```
Import → Sort → Re-write → Export
```

Each stage is designed to be transparent, auditable, and collaborative — ensuring automation never replaces editorial judgment.

---

## 🎯 Objectives

- Build a **proof-of-concept (POC)** for an end-to-end editorial pipeline enriched by AI  
- Test integration between **Letta (AI orchestration)** and **Supabase (data persistence)** via MCP  
- Provide a **Next.js frontend** for human editors to review and validate AI suggestions  
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
| **Backend / AI Orchestration** | [Letta Cloud](https://www.letta.com) | Agent-based AI orchestration |
| **Database** | [Supabase](https://supabase.com) | Storage for imported / validated content |
| **AI ↔ DB Bridge** | MCP (Model Context Protocol) | Secure, structured access between Letta and Supabase |
| **Language** | TypeScript | Unified across all layers |
| **Package Manager** | pnpm | Monorepo package management |
| **ORM / Query Builder** | Drizzle | Lightweight schema management |

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

### 4️⃣ Export
- Export validated content back to Supabase or other publishing endpoints  
- Prepare integration with Refugies.info data pipelines

---

## 🧱 AI Architecture

- **Letta** handles orchestration, task delegation, and conversational logic  
- **Supabase** stores all documents, metadata, and validation states  
- Specialized **Letta Agents** include:  
  - `clarifier-agent` — rewrites content for readability  
  - `classifier-agent` — sorts and tags imported data  
  - `validator-agent` — checks structure and quality  

All interactions between AI and humans are **logged and auditable**.

---

## 🧭 Development Plan

### Timeline
🗓️ 1 month total — **2 sprints (2 weeks each)**

#### Sprint 1 → Import & Sort
- Implement import pipeline and Supabase schema  
- Integrate Letta classification logic via MCP  
- Build initial UI for data review and validation  

#### Sprint 2 → Re-write & Export
- Add rewriting agent and collaborative editor interface  
- Enable validation workflow and export process  
- Deliver functional end-to-end demo  

---

## 🧩 Core User Stories

- **As a content manager**, I can import data files so that the editorial team can process them.  
- **As an editor**, I can view AI-sorted data to focus on relevant content.  
- **As an editor**, I can review AI rewrites and accept or modify them.  
- **As a reviewer**, I can approve and export validated versions for publication.  
- **As a team lead**, I can monitor progress across all stages (import, sort, rewrite, export).

---

## 🗺️ Roadmap

| Phase | Milestone | Description |
|--------|------------|-------------|
| **POC** | MVP prototype | Basic end-to-end functionality |
| **MVP 1** | Improved UX + collaboration | Real-time validation and feedback |
| **MVP 2** | Integration | Connected to Refugies.info publishing system |

---

## 🧠 Notes

This project follows the **[Letta Development Guidelines](https://docs.letta.com)** for API, ADE, and MCP integration.  
The goal of this POC is to validate the technical chain:

**Import → Sort → Rewrite → Export**  
with full **Human-in-the-Loop** control.
