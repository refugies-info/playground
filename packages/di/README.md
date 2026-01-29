# Data Inclusion API Client

TypeScript client for the [Data Inclusion API](https://api.data.inclusion.gouv.fr/).

## Environment Variables

The client requires the following environment variables in the **root `.env`** file:

```bash
DI_BASE_URL=https://api-staging.data.inclusion.gouv.fr
DI_API_KEY=your_api_key_here
DI_PAGE_SIZE=100  # Optional, default: 100, max: 10000
```

## Generating the Client

The client is generated using [@hey-api/openapi-ts](https://www.npmjs.com/package/@hey-api/openapi-ts) from the Data Inclusion OpenAPI specification.

### How to regenerate

```bash
cd packages/di
pnpm run gen:client
```

This will:
1. Load environment variables from the root `.env`
2. Fetch the OpenAPI spec from `$DI_BASE_URL/api/openapi.json`
3. Filter out `/api/v0/` endpoints (only v1 endpoints are generated)
4. Generate TypeScript client files in `src/hey-api/`

### Configuration

The generation is configured in `openapi-ts.config.ts`. Currently it:
- Excludes all `/api/v0/` endpoints via regex filter
- Uses `@hey-api/client-fetch` for HTTP requests

### Generated Files

The generated client is located in `src/hey-api/` and includes:
- `client.gen.ts` - Configured HTTP client instance
- `sdk.gen.ts` - API endpoint functions
- `types.gen.ts` - TypeScript types for all API models
- `index.ts` - Main exports

## Usage

### Fetching Structures

```typescript
import { fetchCarifOrefStructures } from '@refugies-info/di';

// Fetch all carif-oref structures
const structures = await fetchCarifOrefStructures();

// Fetch with options
const structures = await fetchCarifOrefStructures({
  pageSize: 100,
  limit: 10,  // Fetch only 10 structures (for testing)
  onProgress: (current, total) => console.log(`${current}/${total}`),
});
```

### Ingesting to Database

```typescript
import { ingestCarifOrefStructures } from '@refugies-info/di';
import { getSupabaseAdmin } from '@playground/supabase';

const supabase = getSupabaseAdmin();

// Ingest all structures (with version tracking)
const result = await ingestCarifOrefStructures(supabase);

console.log(`Run ID: ${result.runId}`);
console.log(`Fetched: ${result.totalFetched}`);
console.log(`Inserted: ${result.totalInserted} (new)`);
console.log(`Updated: ${result.totalUpdated} (new versions)`);
console.log(`Unchanged: ${result.totalUnchanged} (skipped)`);
console.log(`Errors: ${result.errors.length}`);

// Ingest with limit (for testing)
const result = await ingestCarifOrefStructures(supabase, {
  limit: 10,
});
```

### Using the Client Directly

```typescript
import { listStructuresEndpointApiV1StructuresGet } from '@refugies-info/di';

// The client is automatically configured with DI_BASE_URL and DI_API_KEY
const response = await listStructuresEndpointApiV1StructuresGet({
  query: {
    page: 1,
    size: 100,
    sources: ['carif-oref'],
  },
});

const structures = response.data.items;
```

## Configuration

The client is pre-configured in `src/index.ts` with:
- Base URL from `DI_BASE_URL` environment variable
- Authorization header with `DI_API_KEY` as Bearer token

You can override these settings per-request by passing options:

```typescript
import { listStructures } from '@refugies-info/di';

await listStructures({
  client: customClientInstance, // Use a different client
  // ... other options
});
```

## Notes

- Generated files in `src/hey-api/` are excluded from Biome linting/formatting
- The client uses the `@hey-api/client-fetch` adapter for HTTP requests
- API endpoints use `/api/v1/` prefix (defined in the OpenAPI spec)

## Ingestion Command

The official ingestion command for syncing data from the Data Inclusion API:

```bash
# Ingest 5 structures (default, for testing)
pnpm di:ingest

# Ingest specific number
pnpm di:ingest --limit 100

# Ingest ALL structures
pnpm di:ingest --all

# Ingest services instead of structures
pnpm di:ingest --type services --limit 50
```

### Features

- **Incremental updates**: Detects new vs. existing records via SHA-1 content hashing
- **Version tracking**: Each update creates a new version (append-only history)
- **Run tracking**: Each ingestion run is logged to `di_ingestion_runs` table
- **Idempotent**: Re-running with same data results in 0 inserts/updates

### Result Fields

| Field | Description |
|-------|-------------|
| `runId` | UUID of this ingestion run (traceable in `di_ingestion_runs`) |
| `totalFetched` | Records fetched from DI API |
| `totalInserted` | New records (version 1) |
| `totalUpdated` | Changed records (version 2+) |
| `totalUnchanged` | Skipped (hash unchanged) |
| `errors` | Records that failed to insert |

### Database Tables

- `di_structures` / `di_services` - Main data tables with version history
- `di_structures_latest` / `di_services_latest` - Views for current versions only
- `di_ingestion_runs` - Tracks each ingestion run with stats
