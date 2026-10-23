# Data Inclusion Ingestion Testing Guide

This guide explains how to test the Data Inclusion (DI) ingestion module, which fetches and stores structures and services from the Carif-Oref API.

---

## Overview

The DI ingestion module (`@refugies-info/di`) provides functions to fetch data from the Data Inclusion API and store it in Supabase tables:

- **`di_structures`**: Stores organization/structure data
- **`di_services`**: Stores service offerings data

Both tables store:
- `raw_data`: Full JSON response from the API (as text)
- `data`: Parsed JSONB for efficient querying

---

## Prerequisites

### 1. Environment Variables

Ensure the following are set in your root `.env` file:

```bash
# Data Inclusion API
DI_BASE_URL=https://api-staging.data.inclusion.gouv.fr
DI_API_KEY=your_api_key_here

# Supabase (for local development)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Start Local Supabase

```bash
supabase start
```

### 3. Run Migrations

Ensure the DI tables are created:

```bash
# Reset database (includes all migrations)
supabase db reset

# Or run specific migrations
supabase db push
```

---

## Test Script

The former smoke script `scripts/test-di-ingestion.ts` no longer exists. To run an ingestion locally, use `pnpm di:ingest` (`scripts/ingest-di.ts`) or trigger the cron route with `pnpm di:cron`.

---

## Database Schema

### `di_structures`

| Column | Type | Description |
|---------|-------|-------------|
| `id` | bigint | Auto-incrementing primary key |
| `created_at` | timestamptz | Record creation time |
| `updated_at` | timestamp | Record update time |
| `raw_data` | text | Full JSON from API |
| `data` | jsonb | Parsed JSON for querying |

**Indexes**:
- GIN index on `data` (for JSONB containment queries)
- B-tree indexes on: `data->>'id'`, `data->>'source'`, `data->>'siret'`, `data->>'commune'`, `data->>'code_postal'`, `data->>'date_maj'`

### `di_services`

| Column | Type | Description |
|---------|-------|-------------|
| `id` | bigint | Auto-incrementing primary key |
| `created_at` | timestamptz | Record creation time |
| `updated_at` | timestamp | Record update time |
| `raw_data` | text | Full JSON from API |
| `data` | jsonb | Parsed JSON for querying |

**Indexes**:
- GIN index on `data` (for JSONB containment queries)
- B-tree indexes on: `data->>'id'`, `data->>'source'`, `data->>'structure_id'`, `data->>'type'`, `data->>'commune'`, `data->>'code_postal'`, `data->>'date_maj'`

---

## Manual Testing with Supabase Studio

After running the test script, verify data in Supabase Studio:

1. Open [http://127.0.0.1:54323](http://127.0.0.1:54323)
2. Go to **Table Editor**
3. Select `di_structures` or `di_services`
4. Verify:
   - Records are present
   - `raw_data` contains full JSON
   - `data` field is properly parsed
   - Indexes are working (try a query)

---

## Troubleshooting

### DI_API_KEY not set

**Error**: `DI_API_KEY not set in root .env`

**Solution**: Add to `.env`:
```bash
DI_API_KEY=your_actual_key_here
```

Get your key from: [Data Inclusion API Dashboard](https://api.data.inclusion.gouv.fr/)

### Cannot connect to Supabase

**Error**: `SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL not set`

**Solution**: Add to `.env`:
```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### No records fetched

**Error**: `No structures fetched. Check DI API connection.`

**Solution**:
1. Check `DI_BASE_URL` is correct
2. Verify `DI_API_KEY` is valid
3. Check network connectivity
4. Try without `--limit` to see if pagination is the issue

### Cleanup fails

**Error**: `Cleanup failed`

**Solution**: This is expected if you ran the test multiple times without cleanup. Manually delete records in Supabase Studio:
```sql
DELETE FROM di_structures WHERE data->>'source' = 'carif-oref';
DELETE FROM di_services WHERE data->>'source' = 'carif-oref';
```

---

## Production Ingestion

For production use, use the ingestion module directly in your code:

```typescript
import { ingestCarifOrefStructures, ingestCarifOrefServices } from "@refugies-info/di";
import { getSupabaseAdmin } from "@playground/supabase";

const supabase = getSupabaseAdmin();

// Ingest structures
const structuresResult = await ingestCarifOrefStructures(supabase, {
  limit: 100, // Optional: limit for testing
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`);
  }
});

console.log(`Fetched: ${structuresResult.totalFetched}`);
console.log(`Inserted: ${structuresResult.totalInserted}`);
console.log(`Errors: ${structuresResult.errors.length}`);

// Ingest services
const servicesResult = await ingestCarifOrefServices(supabase, {
  limit: 100
});

console.log(`Services inserted: ${servicesResult.totalInserted}`);
```

---

## Testing Ingestion Records Creation

After ingesting DI services/structures, you can create `ingestion_records` which transform the raw data into markdown documents with YAML frontmatter.

### Prerequisites

1. Complete DI ingestion (structures or services)
2. Note the `runId` from the ingestion output

### Run Ingestion Records Processing

```bash
# Use latest ingestion run
pnpm tsx scripts/create-di-ingestion-records.ts

# Or specify a specific run ID
pnpm tsx scripts/create-di-ingestion-records.ts <runId>
```

### What It Does

1. **Fetches all services** from the ingestion run (handles pagination for >1000 records)
2. **Fetches associated structures** in batches
3. **Transforms each service** into markdown with YAML frontmatter
4. **Inserts into `ingestion_records`** table with:
   - `markdown`: YAML frontmatter + markdown content
   - `metadata`: Service JSON with nested `structure` object
   - `di_service_id`: FK to `di_services`
   - `di_structure_id`: FK to `di_structures`
   - `version`: Auto-incremented by trigger (starts at 1)

### Expected Output

```bash
[INFO] Using latest ingestion run
    runId: "84ef032c-15c9-45fa-967a-5d8082bf1320"
    type: "services"
    totalFetched: 6103
    totalInserted: 6098

[INFO] Processing ingestion records
    serviceCount: 6098

[INFO] Fetching structures
    uniqueStructureCount: 2027

[INFO] Structures fetched successfully
    fetchedStructures: 2027

[INFO] Ingestion records created successfully
    totalInserted: 6098

✅ Successfully processed ingestion records
```

### Verification in Supabase Studio

Open [http://127.0.0.1:54323](http://127.0.0.1:54323) and run these queries:

#### 1. Check Total Records

```sql
SELECT origin, COUNT(*) as count
FROM ingestion_records
GROUP BY origin;
```

Expected: Show counts for both `DI` and `RCO` (if any).

#### 2. Verify Structure in Metadata

```sql
SELECT
  id,
  version,
  metadata->>'id' as service_id,
  metadata->>'nom' as service_name,
  metadata->'structure'->>'id' as structure_id,
  metadata->'structure'->>'nom' as structure_name
FROM ingestion_records
LIMIT 10;
```

Should show `structure_id` and `structure_name` populated.

#### 3. Sample Markdown with Frontmatter

```sql
SELECT
  id,
  SUBSTRING(markdown FROM 1 FOR 500) as frontmatter_preview
FROM ingestion_records
LIMIT 1;
```

Should show YAML frontmatter like:
```yaml
---
id: carif-oref--01_AL1730075
nom: Service Name
type: formation
structure:
  id: carif-oref--01_312
  nom: Structure Name
  ...
---

# Service Name

Description here...
```

#### 4. Check Version Distribution

```sql
SELECT
  version,
  COUNT(*) as count
FROM ingestion_records
GROUP BY version
ORDER BY version;
```

All records should be `version = 1` initially.

---

## Next Steps

After successful ingestion testing:

1. **Query the data**: Use Supabase client to query `di_structures` and `di_services`
2. **Build features**: Create UI to display structures and services
3. **Implement updates**: Add logic to refresh data periodically
4. **Add filtering**: Use JSONB indexes for efficient queries
5. **Create workflows**: Use ingestion records as input for editorial workflows

---

## Related Documentation

- [Environment Variables Reference](../reference/environment-variables.md) - DI configuration
- [Database Schema](../database/schema.md) - Table definitions
- [Testing Guide](./testing.md) - General testing practices
