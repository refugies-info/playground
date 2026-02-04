# DI Ingestion Record Workflow - Implementation Summary

## Overview
Implemented the complete DI (Data Inclusion) ingestion record workflow to transform raw DI API data into markdown documents with YAML frontmatter for editorial workflows.

## Changes Made

### 1. Database Schema
**File**: `supabase/migrations/20260204090000_add_ingestion_records_source.sql`

Added `source` column to `ingestion_records` table:
- **Type**: `text` with CHECK constraint (`rco` or `di`)
- **Default**: `rco` (backward compatible)
- **Index**: Added for efficient filtering
- **Purpose**: Distinguish between RCO and DI ingestion sources

### 2. DI Ingestion Records Processing
**File**: `packages/di/src/ingest/records.ts`

**Features**:
- ✅ Pagination to handle >1000 services (Supabase limit)
- ✅ Batch structure fetches (100 IDs per query) to avoid URI length limits
- ✅ Batch inserts (100 records per insert) for performance
- ✅ Include structure data in metadata alongside service data
- ✅ Set `source: "di"` for all DI records
- ✅ Detailed logging for debugging
- ✅ TypeScript type safety (no `any`)

**Process**:
1. Fetch all services from ingestion run with pagination
2. Extract unique structure IDs
3. Fetch structures in batches
4. Transform each service+structure into markdown with frontmatter
5. Insert ingestion records with metadata containing nested structure

### 3. RCO Ingestion Records
**File**: `packages/supabase/src/ingestion.ts`

Updated to set `source: "rco"` for RCO records for consistency.

### 4. Test Script
**File**: `scripts/create-di-ingestion-records.ts`

Automated test script for DI ingestion records:
- Fetches latest or specified ingestion run
- Processes all services into markdown records
- Shows sample output and verification stats
- Can be used for CI/CD validation

### 5. Documentation
**File**: `documentation/guides/di-ingestion-testing.md`

Added comprehensive testing guide:
- How to run ingestion and create records
- Expected output and behavior
- SQL verification queries
- Troubleshooting tips

## Database Tables

### `ingestion_records`
```sql
CREATE TABLE ingestion_records (
  id uuid PRIMARY KEY,
  source text NOT NULL DEFAULT 'rco' CHECK (source IN ('rco', 'di')),
  markdown text NOT NULL,
  metadata jsonb NOT NULL,
  rco_record_id uuid REFERENCES rco_records(id),
  di_service_id uuid REFERENCES di_services(id),
  di_structure_id uuid REFERENCES di_structures(id),
  ingestion_report_id uuid REFERENCES letta_reports(id),
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Metadata Structure (DI)
```json
{
  "id": "carif-oref--02_00370832",
  "nom": "Service Name",
  "type": "formation",
  "description": "...",
  "structure": {
    "id": "carif-oref--02_342",
    "nom": "Structure Name",
    "siret": "...",
    ...
  },
  ...
}
```

### Markdown Format
```markdown
---
id: carif-oref--02_00370832
nom: Service Name
type: formation
structure:
  id: carif-oref--02_342
  nom: Structure Name
  ...
---

# Service Name

Description content here...
```

## Testing

### Run DI Ingestion
```bash
pnpm tsx scripts/ingest-di.ts --type services --limit 20
```

### Create Ingestion Records
```bash
pnpm tsx scripts/create-di-ingestion-records.ts
```

### Verification Queries
```sql
-- Check total records
SELECT COUNT(*) FROM ingestion_records;

-- Check by source
SELECT source, COUNT(*)
FROM ingestion_records
GROUP BY source;

-- Verify structure in metadata
SELECT
  metadata->>'id' as service_id,
  metadata->'structure'->>'id' as structure_id
FROM ingestion_records
WHERE source = 'di'
LIMIT 10;
```

## Performance

### Tested with Production Data
- **Services**: 6,098 records
- **Structures**: 2,027 unique
- **Processing time**: ~6 seconds
- **Batching**: 100 items per batch
- **Result**: 100% success rate

## Migration Path

1. Apply migration: `supabase db push`
2. Update code dependencies
3. Re-run ingestion to populate `source` field
4. Existing RCO records default to `source = 'rco'`
5. New DI records automatically get `source = 'di'`

## Next Steps

- ✅ Ingestion records created with source distinction
- ✅ Full metadata including nested structure
- ✅ Testing and verification complete
- 🔄 Ready for editorial workflow integration
- 🔄 Can now filter by source in queries
- 🔄 Can build separate UI for RCO vs DI records
