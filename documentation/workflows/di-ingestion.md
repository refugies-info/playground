# Workflow d'ingestion DI

## Vue d'ensemble

Le workflow d'ingestion DI (`diIngestionWorkflow`) importe les fiches de l'API Data Inclusion (DI), évalue leur conformité via un agent Letta, et génère les métadonnées associées. Il s'exécute en cron (dimanche–jeudi à 2h00).

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
| `MAX_EDITORIAL_BACKLOG` | Taille max du backlog éditorial (records avec rapports Letta en attente de travail éditorial) | `50` |
| `PLAYGROUND_AGENT_ID` | Agent Letta pour l'audit compliance | — |
| `METADATA_AGENT_ID` | Agent Letta pour les métadonnées | fallback sur `PLAYGROUND_AGENT_ID` |

## Throttling par backlog éditorial (RI-1172)

Le workflow n'importe pas de nouveaux records via Letta si le backlog éditorial dépasse `MAX_EDITORIAL_BACKLOG`. Le backlog est défini comme les records qui :

1. Ont déjà un rapport Letta (`ingestion_report_id IS NOT NULL`)
2. Sont prêts pour le travail éditorial (`compliance_status = 'compliant'`)

Ceci permet de contrôler les coûts Letta en ne traitant que lorsque l'équipe éditoriale a de la capacité.

## Claim atomique

Le step `claimDiAuditTargetsStep` utilise le RPC Supabase `claim_di_audit_targets` qui pose un `FOR UPDATE SKIP LOCKED` pour éviter les doublons en cas de runs concurrents. Le RPC compte le backlog éditorial avant de claimer de nouveaux records.
