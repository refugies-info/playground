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

## Versioning DI : source active vs dernière source disponible

Le workflow distingue deux notions pour les fiches issues de Data Inclusion :

| Colonne | Signification |
|---|---|
| `workflows.ingestion_record_id` | **Source active / acceptée** utilisée par la fiche et par l'UI courante. |
| `workflows.latest_ingestion_record_id` | **Dernière source DI disponible** pour ce même service DI stable. |

Cette séparation évite qu'une fiche éditorialisée change automatiquement de source lorsqu'une nouvelle version DI arrive. La fiche continue d'utiliser sa source active, tandis que la dernière version disponible reste visible comme mise à jour en attente.

### Règle métier

Quand un nouvel `ingestion_record` DI est créé :

1. **Première version DI**
   - `ingestion_record_id = latest_ingestion_record_id = nouvelle version`
   - un nouveau workflow est créé.

2. **Nouvelle version DI, sans `editorial_record`**
   - la fiche n'a pas encore de travail éditorial ; elle suit automatiquement la dernière source.
   - `ingestion_record_id = latest_ingestion_record_id = nouvelle version`.

3. **Nouvelle version DI, avec `editorial_record` existant**
   - la fiche a déjà une base éditoriale ; la nouvelle source n'est pas acceptée automatiquement.
   - `ingestion_record_id` reste inchangé.
   - `latest_ingestion_record_id` pointe vers la nouvelle version.

`workflows_enriched` expose les champs utiles à l'affichage des versions :

| Champ de vue | Exemple | Rôle |
|---|---:|---|
| `active_ingestion_version` | `1` | Version active / acceptée. |
| `latest_ingestion_version` | `4` | Dernière version disponible. |
| `has_pending_ingestion_update` | `true` | Indique qu'une version plus récente existe. |
| `pending_ingestion_record_id` | UUID v4 | Version à accepter plus tard. |
| `ingestion_version_label` | `1/4` | Label prêt pour l'UI. |

Toutes les données principales de `workflows_enriched` (`ingestion_markdown`, `ingestion_metadata`, `compliance_status`, `ingestion_report_id`, dates de session, nombre de mots) restent basées sur la **source active** (`workflows.ingestion_record_id`). `latest_ingestion_record_id` sert uniquement à détecter et afficher une version plus récente tant qu'elle n'est pas acceptée.

### Audit des versions en attente

Une version en attente peut être auditée même si elle n'est pas encore la source active du workflow. Si elle est conforme, ses métadonnées sont générées comme pour une version active. Les rapports sont liés à l'`ingestion_record` concerné via `ingestion_report_id` et `metadata_report_id`, ce qui permet de garder les rapports d'une version en attente séparés de ceux de la source active.

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
