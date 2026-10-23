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

### AI Agents (Letta)

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm force:metadata` | `force-metadata-reports.ts` | [Force (re)generation of metadata reports](./force-metadata-reports.md) |
| `pnpm list:agents` | `list-agents.ts` | List all Letta agents in the project |

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
