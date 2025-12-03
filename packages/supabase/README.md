# @playground/supabase

Shared Supabase client and utilities for the Content Playground monorepo.

## Installation

```bash
pnpm add @playground/supabase
```

## Usage

```typescript
import { supabaseClient, getSupabaseServer } from "@playground/supabase";

// Client-side usage
const { data, error } = await supabaseClient.from("table").select("*");

// Server-side usage (API routes only)
const serverClient = getSupabaseServer();
const { data, error } = await serverClient.from("table").select("*");

// Script usage (Node.js scripts)
import { createScriptClient } from "@playground/supabase";

// Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from env
const scriptClient = createScriptClient();

// Or pass credentials explicitly
const customClient = createScriptClient("https://xyz.supabase.co", "service-role-key");
```

## Environment Variables

This package relies on the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_ROLE_SECRET`) - Server-side only
- `SUPABASE_URL` - Script usage (optional fallback)
- `SUPABASE_KEY` - Script usage (optional fallback)
