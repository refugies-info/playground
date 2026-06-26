# Local dev with a local model (zero token cost)

All agent calls in this repo go through `createLettaClient()` (`packages/agents/src/clients.ts`).
By default it talks to **Letta Cloud** (`https://api.letta.com`) — which runs paid
models and burns tokens on every ingestion / metadata / editorial / translation step.

For development you can run everything against a **self-hosted Letta server backed
by a local LLM (Ollama)**. No cloud calls, no cost.

## How the switch works

`createLettaClient()` picks the mode from env:

| Mode  | Trigger                                      | URL                     | Cost |
| ----- | -------------------------------------------- | ----------------------- | ---- |
| Local | `LETTA_BASE_URL` set, or `LETTA_ENVIRONMENT=local` | `http://localhost:8283` | free |
| Cloud | neither set (default)                        | `https://api.letta.com` | paid |

In local mode no `LETTA_API_KEY` / `LETTA_PROJECT_ID` is required (the local
server runs auth-less with `SECURE=false`).

## Quick start

One command boots Letta + Ollama, pulls the models, and creates the local agents:

```bash
pnpm letta:init
```

Then copy the printed `*_AGENT_ID` lines into `.env` (step 3 below), plus
`LETTA_BASE_URL=http://localhost:8283`.

Helper scripts:

| Command                  | Does                                              |
| ------------------------ | ------------------------------------------------- |
| `pnpm letta:up`          | start Letta + Ollama (detached)                   |
| `pnpm letta:pull`        | pull `qwen2.5:0.5b` + `nomic-embed-text`          |
| `pnpm letta:sync`        | restart Letta so it discovers newly pulled models |
| `pnpm letta:logs`        | tail server logs                                  |
| `pnpm letta:down`        | stop the stack                                    |
| `pnpm agents:create-local` | create local agents, print their IDs            |
| `pnpm letta:init`        | up + pull + sync + create-local (all of the above)|

## Manual setup

### 1. Start Letta + Ollama

```bash
pnpm letta:up
```

### 2. Pull a local model

`qwen2.5:0.5b` is the default — ~400MB, runs on modest hardware. Use a larger
model (`qwen2.5:3b`, `qwen2.5:7b`, `llama3.1:8b`, …) for better quality.

```bash
pnpm letta:pull
```

> ⚠️ Letta agents need a **tool-capable** model (function calling). `gemma3:1b`
> has no `tools` capability and is silently dropped — you'll see
> `Synced 0 LLM models` in the logs and `Handle ... not found, must be one of []`
> when creating agents. Check a model with `ollama show <model>` → `Capabilities`.

> ⚠️ **Do not use `letta/letta-free` on the self-hosted server.** For free *and* prod-grade
> quality, use **Letta Cloud** (`LETTA_BASE_URL=https://api.letta.com`) with a
> valid `LETTA_API_KEY` and the `letta/letta-free` model there. On self-hosted,
> Ollama is the only zero-cost option that actually runs.

Letta only discovers Ollama models **at startup**. After pulling a new model,
restart it so the model registers:

```bash
pnpm letta:sync
```

### 3. Point the app at the local server

In `.env`:

```dotenv
LETTA_BASE_URL=http://localhost:8283
```

### 4. Create local agents and wire their IDs

The cloud agent IDs (`PLAYGROUND_AGENT_ID`, `METADATA_AGENT_ID`, …) do **not**
exist on your local server — create equivalents there and point the env vars at them.

Run the helper script (it refuses to touch Letta Cloud, so it can never create
paid agents):

```bash
LETTA_BASE_URL=http://localhost:8283 pnpm agents:create-local
```

It creates `playground-local` + `metadata-local` and prints the env lines to copy
into `.env`:

```dotenv
PLAYGROUND_AGENT_ID=agent-<local-id>
METADATA_AGENT_ID=agent-<local-id>   # falls back to PLAYGROUND_AGENT_ID if unset
```

Override the model handles with `LOCAL_LLM_MODEL` / `LOCAL_EMBEDDING_MODEL`.

List what you have any time:

```bash
pnpm tsx scripts/list-agents.ts
```

## Switching back to cloud

Comment out / remove `LETTA_BASE_URL` in `.env`. Cloud mode resumes and uses
`LETTA_API_KEY` + `LETTA_PROJECT_ID` again.

## Which `.env`?

- **Root `/.env`** — backend, agents, scripts (`createLettaClient`, `pnpm agents:create-local`).
  This is where `LETTA_*` and `*_AGENT_ID` live.
- **`apps/frontend/.env`** — Next.js frontend only (`NEXT_PUBLIC_*`).

## Notes

- Local models are weaker than the cloud models — output quality (metadata YAML,
  editorial simplification) will be lower. Use local for plumbing/iteration,
  cloud for quality checks.
- Prompts, slash commands (`/metadata`, …) and schemas are identical in both
  modes; only the runtime + model change.