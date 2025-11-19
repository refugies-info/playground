# Quickstart – Sprint 0 Scaffolding

## 1. Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase project (free tier) with anon + service role keys
- Letta Cloud account (no agents required yet)

## 2. Environment Setup

1. Copy `.env.example` to `apps/frontend/.env.local` (template to be added during implementation).
2. Populate variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   LETTA_API_KEY=sk_prod_...
   ```

3. Never expose `SUPABASE_SERVICE_ROLE_KEY` outside API routes.

## 3. Install & Bootstrap

```bash
pnpm install
pnpm build     # validates Turborepo pipelines
pnpm dev       # runs Next.js on http://localhost:3000
```

## 4. Expected Workspace Layout

```text
content-playground/
├── apps/
│   └── frontend/
├── packages/
│   └── shared/
└── migrations/
```

## 5. Supabase Client Usage

```typescript
import { supabaseClient, supabaseServer } from '@/lib/supabase';

// Client-side read
const { data } = await supabaseClient
  .from('content_items')
  .select('*')
  .eq('language_code', 'fr');

// Server-side write (API route)
const { error } = await supabaseServer
  .from('content_items')
  .insert([{ original_text: body.text, language_code: 'fr' }]);
```

## 6. Dev Workflow Checklist

- [ ] `pnpm install` completes with no peer conflicts
- [ ] `turbo build` finishes <2 minutes
- [ ] `turbo dev` starts Next.js without port conflicts
- [ ] Tailwind styles render via CSS imports (no config file)
- [ ] `pnpm dlx shadcn-ui add button` installs component
- [ ] `lib/supabase.ts` exports both clients with correct env usage

## 7. Troubleshooting

- **Missing env vars**: Next.js will warn during build; verify `.env.local`.
- **Supabase auth failures**: confirm anon key matches project + domain.
- **pnpm not found**: install via `corepack enable` or `npm install -g pnpm`.
