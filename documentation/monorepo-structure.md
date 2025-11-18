# Monorepo Structure & Architecture

**Last Updated**: 2025-11-18  
**Status**: POC Sprint 1  
**Constitution Version**: v1.4.0 (Simplified for 2-person team)

## Overview

This project uses **Turborepo** to manage a monorepo with 2 workspaces and supporting folders. The structure is optimized for a 2-person POC team:

- **Jeremie**: Frontend (Next.js UI with Tailwind + shadcn/ui, integrates Letta agents)
- **Luis**: Backend & Database (Supabase schema, Letta agent definitions and custom tools)

## Directory Structure

```text
content-playground/
├── apps/
│   └── frontend/                 # Next.js application (Jeremie)
├── packages/
│   └── shared/                   # Shared TypeScript types (both)
├── migrations/                   # Supabase schema & migrations (Luis)
├── documentation/                # Project documentation
├── .specify/                     # Specification templates & scripts
├── .windsurf/                    # Windsurf workflows
├── specs/                        # Feature specifications
├── turbo.json                    # Turborepo configuration
├── package.json                  # Root package.json
├── tsconfig.json                 # Root TypeScript config
├── .gitignore                    # Git ignore rules
└── README.md                     # Project README
```

## POC Scope (Sprint 1-2)

**Constitution v1.4.0** defines a simplified POC focused on **Ingest + Sort workflow**:

- **Sprint 1**: Turborepo + Next.js frontend scaffold (this spec)
- **Sprint 2**: Letta classifier agent + Supabase ingestion pipeline
- **Deferred to MVP**: Rewrite, metadata mapping, publication, full RBAC, CI/CD

**Key Constraints**:
- Manual CSV/JSON upload only (no automatic API triggering)
- Single Letta classifier agent (quality gating)
- Minimal audit trail (who uploaded what, what AI flagged)
- Manual testing only (no automated tests)
- Code comments only (no detailed AI documentation)
- French-only content (language_code = 'fr')

## Workspaces

### 1. `/apps/frontend` (Next.js Application)

**Owners**: Jeremie (UI) & Luis (utility routes)  
**Purpose**: User-facing editorial dashboard + backend utility routes  
**Tech Stack**: Next.js (latest, app router), Tailwind CSS V4, shadcn/ui, Radix UI  
**Sprint 1 Scope**: UI scaffold + utility route structure (no authentication, data fetching, or business logic)

#### Responsibilities

**Jeremie (Frontend UI)**:
- Render UI components for editors, reviewers, and admins
- Handle user interactions (clicks, form submissions, navigation)
- Display content lists, edit forms, metadata mapping interfaces
- Integrate with Letta agents via REST API (quality flags, AI suggestions)
- Call Letta classifier for content quality assessment
- Display AI reasoning and enable manual overrides

**Luis (Utility Routes)**:
- Create utility routes for Letta agent integration (e.g., `/api/classify`, `/api/flags`)
- Implement Letta REST API endpoints
- Handle Supabase queries and custom tool execution
- Manage authentication and authorization for utility routes

#### Key Directories

```text
apps/frontend/
├── app/                          # Next.js app router pages & routes
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (Jeremie)
│   ├── api/                     # Utility routes (Luis)
│   │   ├── classify/            # Letta classifier endpoint
│   │   ├── flags/               # Content flags endpoint
│   │   └── [...].ts             # Other utility routes
│   └── (routes)/                # Feature routes (future)
├── components/                   # React components (Jeremie)
│   ├── ui/                      # shadcn/ui components
│   └── features/                # Feature-specific components (future)
├── styles/                       # Global styles (Tailwind CSS)
├── lib/                          # Utilities and helpers
│   ├── letta-client.ts          # Letta API client (shared)
│   └── supabase.ts              # Supabase client (Luis)
├── public/                       # Static assets
├── package.json                  # Frontend dependencies
└── tsconfig.json                 # TypeScript config
```

#### Sprint 1 Deliverables

**Jeremie (Frontend UI)**:
- ✅ Next.js app initialized with app router
- ✅ Tailwind CSS V4 configured (CSS imports, no config file)
- ✅ shadcn CLI configured for component installation
- ✅ Basic layout and page structure
- ✅ Letta client utility for API calls

**Luis (Utility Routes)**:
- ✅ API route structure (`/api/classify`, `/api/flags`)
- ✅ Supabase client setup in `lib/supabase.ts`
- ✅ Placeholder endpoints ready for Sprint 2 implementation
- ⏳ Actual Letta integration and business logic (Sprint 2+)

### 2. `/packages/shared` (Shared Types)

**Owner**: Both (Luis & Jeremie)  
**Purpose**: Single source of truth for TypeScript types and constants  
**Tech Stack**: TypeScript

#### Responsibilities

- Define core entity types (User, ContentItem, ContentRevision, etc.)
- Export constants (roles, statuses, API endpoints)
- Provide validation schemas (future)
- Ensure type consistency across frontend and backend

#### Key Files

```text
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.ts              # User, Editor, Reviewer, Admin types
│   │   ├── content.ts           # ContentItem, ContentRevision types
│   │   ├── flags.ts             # ContentFlag type
│   │   ├── metadata.ts          # MetadataMapping type
│   │   └── index.ts             # Export all types
│   ├── constants/
│   │   ├── roles.ts             # User roles (editor, reviewer, admin)
│   │   ├── statuses.ts          # Content statuses (draft, published, archived)
│   │   └── index.ts             # Export all constants
│   └── index.ts                 # Main export file
├── package.json                  # Shared package config
└── tsconfig.json                 # TypeScript config
```

#### Sprint 1 Deliverables

- ✅ Core entity types defined
- ✅ Role and status constants exported
- ✅ Available for import in frontend and backend

### 3. `/migrations` (Database Schema & Migrations)

**Owner**: Luis  
**Purpose**: Version-controlled Supabase schema and migrations  
**Tech Stack**: SQL, Supabase CLI  
**Sprint 1 Scope**: Schema design only (tables for content_items, content_flags, shared types)

#### Responsibilities

- Define database tables and columns for Ingest + Sort workflow
- Design schema to support future expansion (language_code, source_system, source_record_id)
- Document table relationships and constraints
- Prepare for Sprint 2 deployment

#### Key Files (Sprint 1)

```text
migrations/
├── 001_content_schema.sql        # content_items, content_flags, users tables
├── 002_audit_fields.sql          # created_by, created_at, source tracking
├── 003_language_support.sql      # language_code column for future multi-language
└── README.md                     # Schema documentation
```

#### Sprint 1 Deliverables

- ✅ Database schema designed (content_items, content_flags, users tables)
- ✅ Audit fields included (created_by, created_at, source_system, source_record_id)
- ✅ Language support column added (language_code = 'fr' for POC)
- ⏳ RLS policies and indexes deferred to Sprint 2
- ⏳ Supabase project provisioned (separate from monorepo)

## Turborepo Configuration

### Root `turbo.json`

Defines build tasks and caching strategy:

```json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    }
  }
}
```

### Running Tasks

```bash
# Build all workspaces
npm run build
turbo build

# Start development servers
npm run dev
turbo dev

# Lint all workspaces
npm run lint
turbo lint

# Run specific workspace
turbo build --filter=frontend
turbo dev --filter=shared
```

## Shared Dependencies

### Root `package.json`

Manages shared dependencies and scripts:

```json
{
  "name": "content-playground",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "apps/frontend",
    "packages/shared"
  ],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0"
  }
}
```

## Development Workflow

### For Jeremie (Frontend)

1. **Start development server**:

   ```bash
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

2. **Add shadcn components**:

   ```bash
   cd apps/frontend
   npx shadcn-ui add button
   npx shadcn-ui add input
   ```

3. **Import shared types**:

   ```typescript
   import { User, ContentItem, ContentFlag } from '@shared/types';
   ```

4. **Call Letta classifier** (Sprint 2+):

   ```typescript
   // Call Letta classifier via REST API
   const response = await fetch('http://localhost:8000/classify', {
     method: 'POST',
     body: JSON.stringify({ content_id: item.id })
   });
   const { flag_status, ai_reasoning } = await response.json();
   ```

5. **Build for production**:

   ```bash
   npm run build
   ```

### For Luis (Backend & Letta)

1. **Define database schema**:
   - Edit SQL files in `/migrations`
   - Include content_items, content_flags, users tables
   - Test locally with Supabase CLI

2. **Develop Letta classifier agent** (Sprint 2+):
   - Define agent in `/apps/backend` (deferred to Sprint 2)
   - Create custom tools wrapping Supabase Client
   - Deploy to Letta Cloud

3. **Create custom Letta tools**:
   - Tools read from content_items table
   - Tools write to content_flags table
   - Enforce row-level security and audit logging

4. **Update shared types**:
   - Add new types to `/packages/shared/src/types`
   - Export from `/packages/shared/src/index.ts`
   - Ensure types match database schema

5. **Coordinate with frontend**:
   - Communicate Letta REST API endpoints
   - Agree on request/response formats
   - Share AI reasoning format for UI display

## Sprint 1 Exit Criteria

- ✅ Monorepo initialized with 2 workspaces + migrations folder
- ✅ `npm install` resolves all dependencies without conflicts
- ✅ `turbo build` completes successfully in under 2 minutes
- ✅ `turbo dev` starts all servers without port conflicts
- ✅ Next.js frontend runs on localhost:3000
- ✅ Tailwind CSS compiles without config file
- ✅ shadcn CLI ready for component installation
- ✅ Shared types exported and importable
- ✅ Database schema defined (in `/migrations`)

## Sprint 2+ Expansion (Per Constitution v1.4.0)

Once Ingest + Sort is validated with real users, the monorepo expands to support multi-stage workflow:

```text
content-playground/
├── apps/
│   ├── frontend/                 # Existing (enhanced with Ingest UI)
│   └── backend/                  # NEW: Letta agent definitions
├── packages/
│   ├── shared/                   # Existing (expanded types)
│   ├── letta-tools/              # NEW: Custom Letta tools for Supabase
│   └── supabase-client/          # NEW: Database client wrapper (optional)
├── migrations/                   # Existing (RLS policies, indexes added)
└── ...
```

### Sprint 2 Additions

**Luis (Backend & Letta)**:
- **`/apps/backend`**: Letta classifier agent definition + REST API server
- **`/packages/letta-tools`**: Custom tools wrapping Supabase Client for data access
- **`/migrations`**: Add RLS policies, indexes, and Supabase Auth schema
- Deploy classifier agent to Letta Cloud

**Jeremie (Frontend)**:
- Add Ingest UI (CSV/JSON upload form)
- Add Sort UI (flag review, manual override interface)
- Integrate Letta classifier REST API calls
- Display AI reasoning and enable editor overrides

**Both**:
- Define Letta REST API contract (endpoints, request/response formats)
- Agree on AI reasoning format for UI display
- Test Ingest + Sort workflow with real users

### MVP Expansion (Post-Sprint 2)

- **Rewrite Agent**: AI-assisted content refinement
- **Metadata Mapping**: Editor validation interface
- **Publication Workflow**: Draft/published/archived states
- **Full RBAC**: Editor, reviewer, admin roles
- **CI/CD**: GitHub Actions → Vercel deployment

## Troubleshooting

### Dependencies not resolving

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Turborepo cache issues

```bash
# Clear Turborepo cache
turbo prune --docker
rm -rf .turbo
npm run build
```

### Port conflicts

- Frontend defaults to port 3000
- Check for other processes: `lsof -i :3000`
- Change port in `apps/frontend/package.json` if needed

## Constitution Alignment

This monorepo structure is designed to comply with **Constitution v1.4.0**:

- ✅ **Principle 6 (Minimal Monorepo)**: 2 workspaces + `/migrations` folder for 2-person team
- ✅ **Principle 3 (Two-Stage Workflow)**: Ingest + Sort focus for Sprint 1-2
- ✅ **Principle 4 (Letta Classifier)**: Single agent deployment in Sprint 2
- ✅ **Principle 2 (Data Ingestion)**: Manual CSV/JSON upload, Letta quality gating
- ✅ **Principle 7 (POC Pragmatism)**: Manual testing, Letta Cloud, Supabase free tier

For full Constitution details, see `.specify/memory/constitution.md`.

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS V4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Content Playground Constitution v1.4.0](./.specify/memory/constitution.md)
