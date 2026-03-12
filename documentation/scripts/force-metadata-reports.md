# Force Metadata Reports

> Regenerate AI metadata reports for all (or failed) ingestion records.

## Why

Two main use cases:

1. **Agent retraining** — After updating the Letta metadata agent's training data or prompt, regenerate all reports to benefit from improved mappings.
2. **Retry failures** — Network timeouts or Supabase issues may cause some reports to fail. Retry only the failed ones without touching the successful reports.

## Prerequisites

### Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (admin access) |
| `LETTA_API_KEY` | ✅ | Letta Cloud API key |
| `LETTA_PROJECT_ID` | ✅ | Letta Cloud project ID |
| `METADATA_AGENT_ID` | ⚡ | Metadata agent ID (falls back to `PLAYGROUND_AGENT_ID`) |
| `PLAYGROUND_AGENT_ID` | ⚡ | Fallback agent ID |

⚡ At least one of `METADATA_AGENT_ID` or `PLAYGROUND_AGENT_ID` is required.

For **local testing**, your existing `.env` has everything.
For **production**, copy `.env.production.example` to `.env.production` and fill in production values.

## Usage

```bash
# Regenerate ALL metadata reports locally (default)
pnpm force:metadata

# Target production database (loads .env.production, asks for confirmation)
pnpm force:metadata --prod

# Dry run — see what would be processed, no Letta calls or DB writes
pnpm force:metadata --dry-run

# Retry only failed reports (latest metadata report has status='error')
pnpm force:metadata --retry-failed

# Combine flags
pnpm force:metadata --prod --retry-failed --dry-run
```

### `--prod` flag

By default, the script loads `.env` and targets your **local** Supabase instance.

When `--prod` is passed:
1. Loads `.env.production` instead (must exist — see `.env.production.example`)
2. Displays a warning box with the target Supabase URL
3. Asks for interactive confirmation (`y/N`) before proceeding
4. Dry-run mode (`--dry-run`) skips the confirmation prompt

## How It Works

### Pipeline

```
1. Fetch all ingestion_records with ingestion_report_id IS NOT NULL
   (compliance/audit report completed)

2. Join with workflows to get workflow_id

3. [If --retry-failed] Filter to only workflows whose latest
   metadata letta_report has status='error'

4. For each target (concurrency: 5):
   a. Create a unique Letta conversation (forced-metadata-{workflowId}-{timestamp})
   b. Call generateMetadataReport with the ingestion markdown
   c. Parse agent response (content + metadata)
   d. Insert new letta_report (type: 'metadata')

5. On failure: insert error letta_report (status: 'error', raw_response: error message)

6. Print summary with success/failure counts
```

### Idempotence

Each run creates **new** `letta_reports`. Existing reports are never modified or deleted.

The frontend always takes the **most recent** metadata report per workflow:

```sql
SELECT * FROM letta_reports
WHERE workflow_id = ? AND report_type = 'metadata'
ORDER BY created_at DESC
LIMIT 1
```

So new reports automatically replace old ones in the UI without cleanup.

### Error Handling

- Failed targets get a `letta_report` with `status='error'` inserted in DB
- This makes failures visible in the UI
- The `--retry-failed` flag specifically targets these error reports
- The script exits with code 1 if any target fails

### Concurrency

The script runs **5 parallel Letta calls** by default. Each call gets its own conversation (with a unique timestamp) to avoid `409 CONFLICT` errors on retry.

## Example Output

```
INFO: Starting forced metadata report generation
      supabaseUrl: "http://127.0.0.1:54321"  agentId: "agent-..."  DRY_RUN: false  RETRY_FAILED: false

INFO: Metadata generation targets identified  totalRecords: 31  eligibleTargets: 31

INFO: ▶ Starting metadata generation  workflowId: "d020a9f2-..."
INFO: ✔ Metadata report stored (status: complete)  workflowId: "d020a9f2-..."
...
INFO: ✔ [24/31] Metadata succeeded
ERROR: ✘ [25/31] Metadata failed  err: "The upstream server is timing out"
...
INFO: Forced metadata report generation complete  total: 31  succeeded: 24  failed: 7
```

Then retry the 7 failures:

```
$ pnpm force:metadata --retry-failed

INFO: RETRY_FAILED mode — targeting only workflows with failed/missing metadata reports
      totalEligible: 31  retrying: 7  skipped: 24
...
INFO: Forced metadata report generation complete  total: 7  succeeded: 7  failed: 0
```

## Related

- Source: [`scripts/force-metadata-reports.ts`](../../scripts/force-metadata-reports.ts)
- Metadata step: [`packages/workflows/src/steps/ingestion/metadata-di-step.ts`](../../packages/workflows/src/steps/ingestion/metadata-di-step.ts)
- Frontend query: [`apps/frontend/src/services/documents.ts`](../../apps/frontend/src/services/documents.ts) (lines 299-307)