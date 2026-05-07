# Workflow d'ingestion DI

## Vue d'ensemble

Le workflow d'ingestion DI (`diIngestionWorkflow`) importe les fiches de l'API Data Inclusion (DI), évalue leur conformité via un agent Letta, et génère les métadonnées associées. Il s'exécute en cron 6 fois par nuit (0h-5h heure de Paris en été, 23h-4h en hiver), avec un maximum de 10 records par exécution (`MAX_EDITORIAL_BACKLOG`).

## Architecture fan-out

Depuis RI-1119, chaque record est traité par son **propre workflow indépendant**, spawné en parallèle :

```
diIngestionWorkflow (cron)
  ├── [1] ingestStructuresStep     → Importe di_structures
  ├── [2] ingestServicesStep       → Importe di_services
  ├── [3] processRecordsStep       → Crée ingestion_records (si nouvelles données)
  └── [4] fanOutDiRecordsStep      → Claim atomique + spawn N × diSingleRecordWorkflow
                                          │
                                          ├── diSingleAuditStep    → Rapport audit Letta (compliance)
                                          └── diSingleMetadataStep → Rapport metadata Letta
```

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `pipelines/ingestion/di-ingestion.ts` | Orchestrateur principal |
| `pipelines/ingestion/di-single-record.ts` | Workflow enfant (1 record = 1 workflow) |
| `steps/ingestion/di-single-record-steps.ts` | Steps : audit, metadata, claim, fan-out |
| `steps/ingestion/ingest-di.ts` | Import DI → Supabase |
| `steps/ingestion/audit-di-step.ts` | Fallback séquentiel (force-arbitration) |

## Logique de compliance

Un record est `compliant` ssi :
- `letta_report.status === "complete"` (l'agent a répondu correctement)
- `metadata.compliant === true` (l'agent juge le contenu conforme)
- `metadata.duplicate === false` (pas un doublon)

La valeur `compliance_status` est stockée sur `ingestion_records` (pas sur `workflows`).

## Retry

Chaque step de la paire `diSingleAuditStep` / `diSingleMetadataStep` a :
- `maxRetries = 3`
- Backoff exponentiel sur les erreurs Letta API
- `FatalError` sur les erreurs d'authentification (401/403) → pas de retry
- `RetryableError` avec `retryAfter: "1m"` sur le rate limiting (429)

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `MAX_EDITORIAL_BACKLOG` | Nombre max de records claimés par exécution du cron | `10` |
| `PLAYGROUND_AGENT_ID` | Agent Letta pour l'audit compliance | — |
| `METADATA_AGENT_ID` | Agent Letta pour les métadonnées | fallback sur `PLAYGROUND_AGENT_ID` |

## Rate cap par exécution

Chaque exécution du cron claime au maximum `MAX_EDITORIAL_BACKLOG` records candidats (`compliance_status IS NULL`), indépendamment du nombre de records déjà traités en attente côté édito.

## Claim atomique

Le step `claimDiAuditTargetsStep` utilise le RPC Supabase `claim_di_audit_targets` qui pose un `FOR UPDATE SKIP LOCKED` pour éviter les doublons en cas de runs concurrents. Le RPC reclaim aussi les records "zombies" (stuck en `pending` depuis plus de 10 minutes).
