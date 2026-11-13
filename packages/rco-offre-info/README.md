# RCO Offre Info

Client for the Carif-Oref [API Offre Info](https://api-offreinfo.intercariforef.org) (RCO) and the RCO ingestion provider. It is the main source of fiches; Data Inclusion (`packages/di`) is only kept as a fallback through `INGESTION_SOURCE=di`.

## Layers

```text
src/
├── index.ts     # the public API, explicit exports only
├── config.ts    # URL, quotas, search filters (formacodes, certifinfo, funders)
├── types.ts     # SessionOffre and the other swagger shapes
├── provider.ts  # rcoProvider: fetch, plan the writes, batch result
├── api/         # specific to the RCO API: client, search, action detail, normalize
└── lheo/        # LHEO format (Carif-Oref standard): document, structure, markdown,
                 # change detection, arbitrage/, metadata/, plain-language/
```

- `api/` knows HTTP, pagination, retries and the response shape.
- `lheo/` knows the data format only: it would be shared with another LHEO source and will be extracted when one exists.
- `provider.ts` is the only file that writes to the database, through the generic writer in `@playground/supabase/source-ingestion`.

## How a source plugs in

1. The provider implements `IngestionProvider` from `packages/workflows/src/steps/ingestion/ingest-source.ts`: `fetchAll`, `isFatalError`, `ingestBatch`, `emptyResult`, `addResult`, `toRunStats`, `errorsOf`. The batch result keeps the provider's own shape: it is saved as the run checkpoint and read by the latest run card.
2. `ingestBatch` plans the rows, then calls `writeStructures` and `writeServiceVersions` from `@playground/supabase/source-ingestion`, which handle versioning by content hash and the rollback when `ingestion_records` fails.
3. The provider is registered in `PROVIDERS` in `ingest-source.ts`, keyed by `ingestion_runs.source`.
4. AI steps are registered in `packages/workflows/src/steps/sources/index.ts`, keyed by `services.origin`: `arbitrate`, `generateMetadata`, `generatePlainLanguage`, `defaultModel`.

Source identifiers (`rco`, `RCO`, `carif-oref`) are explained in `packages/shared/src/constants/sources.ts`.

## Environment variables

```bash
RCO_TOKEN=...
RCO_BASE_URL=https://api-offreinfo.intercariforef.org   # optional
RCO_MAX_RPS=5                                            # optional, half of the API quota
RCO_MODEL_HANDLE=...                                     # default LLM for RCO fiches
RCO_PLAIN_LANGUAGE_AGENT_ID=...                          # pnpm agents:sync
```

## Tests

```bash
pnpm --filter @playground/rco-offre-info test
```

`tests/ingest.test.ts` characterizes the rows written by `rcoProvider.ingestBatch` against a fake Supabase client.
