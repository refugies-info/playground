# Implementation Plan: Supabase Authentication & Authorization

**Branch**: `003-supabase-auth` | **Date**: 2025-11-20 | **Spec**: [specs/003-supabase-auth/spec.md](spec.md)
**Input**: Feature specification from `/specs/003-supabase-auth/spec.md`

**Note**: This plan is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement Supabase authentication and authorization for the Content Playground editorial workflow. This feature includes: (1) local Supabase development environment with migrations, (2) database schema creation (User, AuthSession, AuditLog, OAuthProvider tables), (3) RLS policies for role-based access control, (4) email/password authentication with email verification, (5) Google OAuth 2.0 integration with account linking, (6) session management with secure JWT tokens, and (7) comprehensive audit logging. This is foundational infrastructure for all editorial features and must be completed before content editing workflows can be implemented.

## Technical Context

**Language/Version**: TypeScript (Next.js 14+, Node.js 18+)  
**Primary Dependencies**: Supabase Auth, Supabase RLS, Supabase Client (`@supabase/supabase-js`), Next.js, Tailwind CSS v4, shadcn/ui, Radix UI  
**Storage**: PostgreSQL (via Supabase) with direct SQL queries (no ORM)  
**Testing**: Manual testing (POC phase per Constitution v1.4.1)  
**Target Platform**: Web (Next.js on Vercel)  
**Project Type**: Web application (monorepo: `/apps/frontend` + `/packages/shared`)  
**Performance Goals**: <100ms login/signup response time, <50ms token validation  
**Constraints**: HTTP-only cookies for token storage, RLS enforcement at database level, no external identity providers except Google OAuth  
**Scale/Scope**: 2-person team (Luis: backend/database, Jeremie: frontend), POC phase with 3-5 editorial team members for validation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Version**: v1.4.1 (2025-11-19)

### Principle Alignment

| Principle | Status | Notes |
|-----------|--------|-------|
| **P1: Human-in-the-Loop Supremacy** | ✅ PASS | Auth enables human control over content access and audit trails. Metadata validation and content lifecycle management deferred to Sprint 2. |
| **P2: Data Ingestion & Quality Gating** | ✅ PASS | Auth is prerequisite for ingestion pipeline. Not directly implementing ingestion in this feature. |
| **P3: Two-Stage POC Workflow** | ✅ PASS | Auth enables Ingest + Sort workflow. Not implementing workflow stages in this feature. |
| **P4: Letta Classifier Agent** | ✅ PASS | Auth enables Letta agent integration. Not implementing agents in this feature. |
| **P5: Basic Audit Trail** | ✅ PASS | AuditLog table tracks all auth events (email_signup, email_login, google_login, account_link, role_change). |
| **P6: Minimal Monorepo for 2-Person Team** | ✅ PASS | Frontend auth UI in `/apps/frontend`, shared types in `/packages/shared`, database migrations in `/migrations`. |
| **P7: POC Pragmatism** | ✅ PASS | Manual testing only, no automated tests. Supabase Auth from day 1 for consistent audit trails. |
| **P8: Content Revision** | ✅ PASS | Not applicable to auth feature. Deferred to Sprint 2. |
| **P9: French-Only Content** | ✅ PASS | Auth is language-agnostic. User interface can be English or French. |
| **P10: Translation Architecture** | ✅ PASS | Auth is language-agnostic. Translation deferred to MVP2. |

**Gate Result**: ✅ **PASS** – Feature aligns with all constitutional principles. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-supabase-auth/
├── spec.md              # Feature specification (user stories, requirements, entities)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (research findings, best practices)
├── data-model.md        # Phase 1 output (entity definitions, database schema)
├── quickstart.md        # Phase 1 output (developer setup guide)
├── contracts/           # Phase 1 output (API contracts, OpenAPI specs)
├── checklists/
│   └── requirements.md  # Quality checklist (validation items)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application monorepo (Turborepo + pnpm)

apps/frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── password-reset/
│   │   │   └── callback/  # OAuth redirect handler
│   │   ├── dashboard/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── GoogleButton.tsx
│   │   │   └── AccountLinking.tsx
│   │   └── ui/  # shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts  # Supabase client initialization
│   │   └── auth.ts      # Auth utilities
│   └── styles/
│       └── globals.css  # Tailwind CSS
├── package.json
└── tsconfig.json

packages/shared/
├── src/
│   ├── types/
│   │   ├── auth.ts      # User, AuthSession, OAuthProvider types
│   │   ├── audit.ts     # AuditLog types
│   │   └── index.ts
│   └── constants/
│       └── roles.ts     # Role definitions (editor, reviewer, admin)
├── package.json
└── tsconfig.json

migrations/
├── 001_create_auth_tables.sql
├── 002_create_rls_policies.sql
└── 003_create_audit_tables.sql

.supabase/
├── config.toml          # Local Supabase configuration
└── seed.sql             # Optional: seed data for local dev

**Structure Decision**: Web application monorepo with 2 workspaces (`/apps/frontend`, `/packages/shared`) per Constitution v1.4.1. Database migrations in `/migrations` directory for team collaboration. Supabase client initialized in `/apps/frontend/lib/supabase.ts`. Auth UI components in `/apps/frontend/src/components/auth/`. Shared types in `/packages/shared/src/types/`.

## Complexity Tracking

> **No violations. Constitution Check passed all principles.**

All implementation decisions align with Constitution v1.4.1. No complexity justification needed.
