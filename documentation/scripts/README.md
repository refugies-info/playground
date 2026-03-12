# Scripts

One-off and utility scripts for database operations, data migration, and AI agent management.

All scripts live in `/scripts` and are invoked via `pnpm` (see `package.json`).

---

## 📋 Script Index

### Data Ingestion

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm di:ingest` | `ingest-di.ts` | Ingest data from the Data Inclusion API into Supabase |
| `pnpm di:extract` | `extract-random-records.ts` | Export random ingestion records as markdown files |
| `pnpm seed:ingestion` | `seed-ingestion.ts` | Seed ingestion records for local development |

### AI Agents (Letta)

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm force:metadata` | `force-metadata-reports.ts` | [Force (re)generation of metadata reports](./force-metadata-reports.md) |
| `pnpm list:agents` | `list-agents.ts` | List all Letta agents in the project |
| `pnpm register:metadata-validator` | `register-metadata-validator-tool.ts` | Register the metadata validation tool on a Letta agent |
| `pnpm update:metadata-schema` | `update-metadata-schema-block.ts` | Update the metadata schema block on a Letta agent |

### Data Conversion

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm convert:dispositifs` | `convert-dispositifs.ts` | Convert dispositifs between formats |
| `pnpm generate:json` | `generate-json.ts` | Generate JSON output from records |
| `pnpm generate:md` | `generate-md.ts` | Generate markdown output from records |
| `pnpm copy:schema` | `copy-schema.ts` | Copy schema definitions |

### Database

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm seed:sync` | *(inline)* | Dump local Supabase data to `supabase/seed.sql` |

### Validation

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm validate:docs` | `validate-docs.ts` | Validate documentation structure and links |

---

## 🔧 Environment

Most scripts read environment variables from `.env` (loaded automatically via `dotenv/config`).

For **production** scripts, create a `.env.production` from the template:

```bash
cp .env.production.example .env.production
# Fill in production values
```

---

## 📖 Detailed Documentation

- [force-metadata-reports](./force-metadata-reports.md) — Force regeneration of AI metadata reports