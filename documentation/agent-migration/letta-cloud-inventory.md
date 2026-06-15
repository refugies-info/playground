# Inventaire de l'agent IA — état au 15 juin 2026

> **Scope** : RI-1258 / PR 01 — Documenter l'inventaire complet de l'agent IA **avant** la migration vers Letta Code SDK + corpus `qmd`.
> **Cible** : fournir une vue de référence exhaustive de ce qui existe aujourd'hui (prompts, blocs mémoire, outils, identifiants, intégrations) pour servir de base aux PR suivants.
> **Branche de référence** : `main` (`9aa3bda`) au 2026-06-15.
>
> ⚠️ Le playground abrite **deux implémentations d'agent IA** qui coexistent :
> 1. **Agent Letta Cloud** (`@letta-ai/letta-client`) — setup **production**, sert les workflows d'ingestion/édition/traduction du frontend Next.js (consomme du **markdown + frontmatter YAML** issu de l'API Data Inclusion). C'est la **source** de la migration.
> 2. **Agent Letta Code** (`.agents/`, `.commands/`, `.skills/`) — setup **scaffoldé** pour un agent "Agathe" travaillant sur des fichiers **RCO XML (Lhéo)**. Pas actif en production aujourd'hui, mais RCO redeviendra pertinent à l'horizon de la migration. C'est la **cible** de la migration.
>
> Le présent document inventorie les deux, en marquant clairement le rôle de chacun dans la migration.
>
> ## Contraintes structurantes (Luis, 15 juin 2026)
>
> 1. **Les ressources Letta Cloud sont gelées.** Letta a déprécié la mise à jour des "File" resources ; les agents en prod reposent sur des ressources uploaded **avant** cette dépréciation et ne seront **plus jamais mises à jour** côté Letta Cloud. Conséquence : la migration ne peut plus compter sur des pushes de prompts/blocs vers l'agent distant — tout doit devenir local et versionné (la cible Letta Code + qmd est précisément ce pattern).
> 2. **Format d'entrée actuel = markdown (frontmatter YAML + corps)** issu de l'API Data Inclusion (structures + services). RCO XML n'est plus utilisé en production mais redeviendra pertinent — les ressources associées doivent être **conservées**.
> 3. **`search_ri_duplicate_dispositifs` n'est pas un outil self-contained.** C'est un **client vers une API ad-hoc du repo karfur** qui renvoie des candidats doublons probables ; l'agent Letta analyse ensuite les résultats. La migration doit donc remplacer ce client par un équivalent playground (requête Supabase sur la table `dispositifs`, cf. PR 20).
> 4. **`ressources_metadatas/base-connaissance.md` (référencé par `.skills/metadata/SKILL.md`) est manquant et doit rester manquant** pour le moment. Luis se charge de vérifier auprès de l'équipe RI si la base est toujours pertinente.

---

## A. Setup 1 — Agent Letta Cloud (production, source de la migration)

### A.1 Configuration

| Élément               | Valeur                                                                                  | Source                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| SDK TypeScript        | `@letta-ai/letta-client@1.10.2`                                                         | `packages/agents/package.json`                                                         |
| URL de base           | `https://api.letta.com`                                                                  | `.env.local`, `.env.production.local`                                                  |
| Project ID (prod)     | `project-pZvdCSjhJ7Fgmi66gqgy`                                                          | `.env.local`, `.env.production.local`                                                  |
| Project ID (default)  | `97c52a94-4e58-4226-9ac3-b000d1dcba78`                                                  | `.env`                                                                                 |
| Variables d'env (api) | `LETTA_API_KEY`, `LETTA_BASE_URL`, `LETTA_PROJECT_ID`                                   | `packages/agents/src/clients.ts`                                                       |

> ⚠️ Les agents Letta Cloud sont définis **uniquement dans le dashboard Letta Cloud** (pas dans ce repo). Aucune version locale du système prompt, des outils ou de la mémoire.

### A.2 Agents configurés

| Usage | Variable d'env / constante | Agent ID (réel, vérifié sur Letta Cloud le 2026-06-15) |
|-------|----------------------------|--------------------------------------------------------|
| **Agent multi-tâches** (audit + rédaction + metadata) | `PLAYGROUND_AGENT_ID` | `PLAYGROUND_AGENT_ID=<REDACTED>` ⚠️ **placeholder littéral** (voir note) |
| Traduction Arabe | `LETTA_AGENT_AR` (défaut) | `agent-c19d4b57-048c-48a7-8cdc-9609dab4b24b` |
| Traduction Ukrainien | `LETTA_AGENT_UK` (défaut) | `agent-add8dcc9-5d2e-4461-aa00-4bfcfe192b59` |
| Traduction Russe | `LETTA_AGENT_RU` (défaut) | `agent-4d7f539b-797b-4b5c-9755-cdffec5cc9f7` |
| Traduction **Pashto** (_ps_) | ⚠️ _non câblé par défaut_ | `agent-42fb380d-5920-437f-b2f3-57d02af4c6a7` |
| Traduction **Tigrinya** (_ti_) | ⚠️ _non câblé par défaut_ | `agent-00b19760-f018-42a8-81d0-1c777b31bf7b` |

> Constantes : `packages/shared/src/constants/languages.ts` → `LETTA_AGENTS_CONFIG`.
> Les 5 agents de traduction sont dans le **projet par défaut** `97c52a94-4e58-4226-9ac3-b000d1dcba78`, pas dans le projet de prod `project-pZvdCSjhJ7Fgmi66gqgy`.
> Les langues `en` (anglais) et `fa` (persan) n'ont effectivement pas d'agent dédié.
>
> ⚠️ **Bug à investiguer** : l'ID littéral `PLAYGROUND_AGENT_ID=<REDACTED>` sur l'agent Agathe indique qu'une variable d'env n'a pas été résolue au moment de la création/listing. À vérifier — la migration Letta Code ne sera pas impactée (ID nouveau), mais c'est à corriger côté Letta Cloud si Agathe doit encore servir en prod.

### A.3 Slash commands (4)

| Slash command        | Phase                  | Fichier source                                       | Schéma de sortie                              |
| -------------------- | ---------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `/audit`             | Audit éditorial        | `packages/agents/src/ingestion.ts`                   | `IngestionMetadataSchema` (Zod)               |
| `/redaction`         | Réécriture éditoriale  | `packages/agents/src/simplification.ts`              | Markdown avec frontmatter préservé            |
| `/metadata`          | Mapping métadonnées    | `packages/agents/src/metadata.ts`                    | `MetadataMetadataSchema` (Zod)                |
| `/translate`         | Traduction multilingue | `packages/workflows/.../generate-translation.ts`     | Markdown traduit                              |

> Constantes : `packages/agents/src/prompts.ts` (`AUDIT_SLASH_COMMAND`, `REDACTION_SLASH_COMMAND`, `METADATA_SLASH_COMMAND`, `TRANSLATE_SLASH_COMMAND`).
> Constante `@deprecated` à supprimer : `INGESTION_AGENT_HEADING` (`packages/agents/src/prompts.ts`).
>
> ⚠️ **Mécanisme d'injection (corrigé suite à l'audit live du 15 juin 2026)** : les **6 agents de prod** ont un `system` prompt réduit à un `base_instructions` quasi-générique (~1.7 ko pour les traducteurs, 4.1 ko pour Agathe qui ajoute une section MemFS) — **aucun** ne contient le prompt éditorial playground. La logique éditoriale est injectée à l'**appel** depuis le code de `packages/agents/src/{ingestion,simplification,metadata}.ts` via les constantes `*_SLASH_COMMAND` (envoyées comme premier message utilisateur avec tool calls), et depuis les **ressources fichiers gelées** (cf. A.4) pour les parties structurantes. Conséquence pour la migration : ces constantes TS doivent migrer telles quelles vers les skills/commands Letta Code, et la "vraie" personnalité de l'agent vit dans le code, pas dans le dashboard.

### A.4 Blocs mémoire de l'agent (côté Letta Cloud, promus depuis le repo)

> **⚠️ Note projet (corrigé suite à l'audit live du 15 juin 2026)** : les 3 blocs ci-dessous sont dans le projet `project-pZvdCSjhJ7Fgmi66gqgy` — qui est **vide côté agents** (0 agent). Ils sont donc **orphelinés** dans le dashboard Letta Cloud. Les 6 agents actifs de prod (Agathe + 5 traducteurs) vivent dans le projet par défaut `97c52a94-…` et ont **0 memory block attaché** — c'est la version `système prompt` (cf. A.3) qui contient tout.

| Bloc mémoire       | Contenu                                                  | Source dans le repo                                                | Script de synchro                                    | État de synchro |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- | --------------- |
| `metadata_schema`  | Spécification TypeScript+YAML du schéma `metadata_ri`   | `packages/agents/src/metadata-schema-spec.ts` (`METADATA_SCHEMA_SPEC`) | `scripts/update-metadata-schema-block.ts`        | 🧊 gelé (cf. contrainte 1) |
| `compliance`       | Prompt de vérification de conformité au périmètre RI     | `packages/agents/prompts/compliance.md`                            | _non scripté_ (mise à jour manuelle)                 | 🧊 gelé (cf. contrainte 1) |
| `doublons`         | Prompt de détection de doublons (Carif-Oref vs RI)       | `packages/agents/prompts/duplicates.md`                            | _non scripté_ (mise à jour manuelle)                 | 🧊 gelé (cf. contrainte 1) |

> 🧊 **Tous les blocs mémoire sont désormais gelés côté Letta Cloud** (la fonctionnalité d'upload de "File" resources a été dépréciée par Letta). Cela veut dire concrètement que :
> - `scripts/update-metadata-schema-block.ts` ne pourra plus modifier le bloc `metadata_schema` de l'agent de production. Il reste utile pour les **environnements de dev/test** éventuels, mais pas pour la prod.
> - Les blocs `compliance` et `doublons` sont figés à la dernière version uploadée (qui peut diverger des fichiers du repo).
> - **C'est l'argument principal pour la migration** : passer à un setup où prompts et blocs sont versionnés localement (Letta Code + qmd) évite cette classe de drift.

### A.5 Outils applicatifs (agent Letta Cloud → frontend)

#### `validate_metadata_ri`

- **Route HTTP** : `POST /api/tools/validate-metadata-ri` ([route.ts](../../apps/frontend/src/app/api/tools/validate-metadata-ri/route.ts))
- **Schéma de validation** : `MetadataRiSchema` (depuis `@playground/shared-types`)
- **Contrat** :
  - Entrée : `{ metadata_ri: object }`
  - Sortie (valide) : `{ valid: true, data: <objet Zod-sanitisé> }`
  - Sortie (invalide) : `{ valid: false, errors: [{ field, message }] }`
- **Enregistrement** : `scripts/register-metadata-validator-tool.ts`
- **Rôle** : l'agent appelle cet outil **avant de finaliser** un frontmatter `metadata_ri`.

#### `search_ri_duplicate_dispositifs`

- **État actuel** : ⚠️ **client HTTP** appelé par l'agent Letta Cloud. Ce n'est pas un outil self-contained : l'agent appelle une **API ad-hoc du repo karfur** (cf. contrainte 3) qui retourne une liste de candidats doublons probables, puis l'agent LLM analyse et qualifie ces candidats.
- **Référence** : `packages/agents/prompts/duplicates.md` (§ `## 📂 Base de connaissances`). Le prompt décrit la stratégie de matching fuzzy + sémantique, mais le matching "machine" est délégué à l'API karfur.
- **Comportement effectif** :
  1. L'agent Letta reçoit un document Carif-Oref.
  2. L'agent appelle le tool `search_ri_duplicate_dispositifs` en passant des métadonnées extraites du document.
  3. Le tool forward la requête à l'API karfur, qui exécute un matching fuzzy (probablement Levenshtein + comparaison de champs) et renvoie les N meilleurs candidats.
  4. L'agent LLM prend ces candidats, les analyse sémantiquement, et produit la décision finale.
- **Implication migration** : ce client n'a pas d'équivalent direct en playground. La migration doit soit :
  - (a) **Réécrire la logique** du matching fuzzy directement en playground (probablement en TypeScript contre la table `dispositifs` du Supabase), ou
  - (b) **Construire une API miroir** dans playground qui imite l'API karfur (transitoire).
  - C'est un livrable attendu du **PR 20** (validation déterministe des doublons).

### A.6 Prompts et samples commités dans le repo

> "Commité dans le repo" = stocké dans git (sous `packages/agents/`), à distinguer des ressources Letta Cloud qui sont hébergées dans le dashboard Letta.

| Fichier                                       | Usage                                                                  | Statut        |
| --------------------------------------------- | ---------------------------------------------------------------------- | ------------- |
| `packages/agents/prompts/compliance.md`       | Bloc mémoire `compliance` (base_instructions + section `<compliance>`) | Commit dans le repo (gelé côté Letta Cloud) |
| `packages/agents/prompts/duplicates.md`       | Bloc mémoire `doublons` (base_instructions + section `<doublons>`)     | Commit dans le repo (gelé côté Letta Cloud) |
| `packages/agents/src/metadata-schema-spec.ts` | Constante `METADATA_SCHEMA_SPEC` (TS + YAML + 7 règles métier)         | Commit dans le repo (gelé côté Letta Cloud) |
| `packages/agents/samples/dispositifs.json`    | Échantillon pour tests unitaires                                       | Commit dans le repo |
| `packages/agents/samples/dispositifs.yaml`    | Échantillon pour tests unitaires (format YAML)                          | Commit dans le repo |

### A.7 Code applicatif (clients & workflows)

#### Package `@playground/agents`

| Fichier                              | Rôle                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `clients.ts`                         | `createLettaClient()` — construit le `Letta` à partir de `LETTA_API_KEY` + `LETTA_PROJECT_ID`       |
| `agents.ts`                          | Helpers bas-niveau : `listAgents`, `getAgent`, `sendMessage`, `sendMessageToConversation`, `findOrCreateConversation`, `runAgentOneShot` |
| `ingestion.ts`                       | `generateIngestionReport()` (stream) + `parseIngestionResponse()` — pour `/audit`                   |
| `simplification.ts`                  | `simplifyContent()` (stream) + `simplifyContentSync()` + `buildMarkdownWithFrontmatter()` — pour `/redaction` |
| `metadata.ts`                        | `generateMetadataReport()` (stream) — pour `/metadata`                                              |
| `parser.ts`                          | `parseAgentResponse()` — extraction + validation Zod du frontmatter                                  |
| `schemas.ts`                         | `IngestionMetadataSchema`, `MetadataMetadataSchema`, `NoFrontmatterSchema`                           |
| `types.ts`                           | `LettaMetadata`, `LettaReportResult`, `LettaApiErrorInfo`, `ReasoningStep`                            |
| `prompts.ts`                         | Constantes des 4 slash commands                                                                      |
| `index.ts`                           | Re-exports                                                                                            |
| `parser.test.ts`                     | Tests unitaires du parser (vitest)                                                                    |

#### Étapes de workflows qui consomment l'agent

##### Production fan-out (cron-driven, current path)

Le cron d'ingestion DI fait tourner la chaîne complète **structures → services → records → fan-out N × single record**. C'est le chemin de production **actif** qui consomme l'agent Letta Cloud.

```
[CRON] → diIngestionWorkflow                        (pipelines/ingestion/di-ingestion.ts)
  ├─ [1] ingestStructuresStep   → di_structures     (steps/ingestion/ingest-di.ts)
  ├─ [2] ingestServicesStep     → di_services       (steps/ingestion/ingest-di.ts)
  ├─ [3] processRecordsStep     → ingestion_records  (steps/ingestion/ingest-di.ts)
  └─ [4] fanOutDiRecordsStep    → N × diSingleRecordWorkflow
                                    │
                                    ├─ diSingleAuditStep     → /audit      (generateIngestionReport)
                                    └─ diSingleMetadataStep  → /metadata   (generateMetadataReport)
```

> Le metadata step n'est appelé **que si** l'audit retourne `compliant` — sinon l'appel LLM est économisé.

| Composant                          | Rôle                                                                      | Source                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `diIngestionWorkflow`              | Pipeline parent (cron)                                                     | `packages/workflows/src/pipelines/ingestion/di-ingestion.ts`                            |
| `fanOutDiRecordsStep`              | Claim & spawn N workflows enfants                                          | `packages/workflows/src/steps/ingestion/di-single-record-steps.ts`                      |
| `diSingleRecordWorkflow`           | Workflow enfant par record (audit → metadata séquentiel)                  | `packages/workflows/src/pipelines/ingestion/di-single-record.ts`                        |
| `diSingleAuditStep`                | Appelle `/audit` via `generateIngestionReport` + parse `IngestionMetadataSchema` | `packages/workflows/src/steps/ingestion/di-single-record-steps.ts`                  |
| `diSingleMetadataStep`             | Appelle `/metadata` via `generateMetadataReport` + parse `MetadataMetadataSchema` | `packages/workflows/src/steps/ingestion/di-single-record-steps.ts`                 |
| `ingestStructuresStep`             | (étape 1) — _n'appelle pas l'agent, ingestion DI brute_                    | `packages/workflows/src/steps/ingestion/ingest-di.ts`                                   |
| `ingestServicesStep`               | (étape 2) — _n'appelle pas l'agent, ingestion DI brute_                    | `packages/workflows/src/steps/ingestion/ingest-di.ts`                                   |
| `processRecordsStep`               | (étape 3) — _n'appelle pas l'agent, crée `ingestion_records`_              | `packages/workflows/src/steps/ingestion/ingest-di.ts`                                   |

##### Force / backfill / per-document (legacy, toujours disponible)

Ces étapes sont **plus anciennes** (avant l'introduction de la fan-out) et restent utilisées pour forcer la régénération ou travailler sur un record précis. La migration doit les **convertir en wrappers** autour de `diSingleRecordWorkflow` (ou les déprécier).

| Étape workflow                            | Slash command | Agent source                    | Source                                                                       |
| ----------------------------------------- | ------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `audit-di-step.ts`                        | `/audit`      | `PLAYGROUND_AGENT_ID`           | `packages/workflows/src/steps/ingestion/audit-di-step.ts`                    |
| `metadata-di-step.ts`                     | `/metadata`   | `PLAYGROUND_AGENT_ID`           | `packages/workflows/src/steps/ingestion/metadata-di-step.ts`                 |
| `force-editorial-step.ts`                 | `/redaction`  | `PLAYGROUND_AGENT_ID`           | `packages/workflows/src/steps/editorial/force-editorial-step.ts`             |

##### Traduction (multilingue)

| Étape workflow                            | Slash command | Agent source                    | Source                                                                       |
| ----------------------------------------- | ------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `generate-translation.ts`                 | `/translate`  | `LETTA_AGENTS_CONFIG[lang]`     | `packages/workflows/src/steps/translation/generate-translation.ts`           |
| `get-available-translation-agents.ts`     | _n/a_         | _n/a_                           | `packages/workflows/src/steps/translation/get-available-translation-agents.ts` |

#### API routes du frontend qui exposent l'agent

| Route                                       | Slash command | Source                                                                       |
| ------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `POST /api/editorial-rewrite`               | `/redaction`  | `apps/frontend/src/app/api/editorial-rewrite/route.ts`                       |
| `GET  /api/editorial-rewrite/[runId]`       | _streaming_   | `apps/frontend/src/app/api/editorial-rewrite/[runId]/route.ts`               |
| `POST /api/agents/metadata/stream`          | `/metadata`   | `apps/frontend/src/app/api/agents/metadata/stream/route.ts`                  |
| `POST /api/classify`                        | (legacy)      | `apps/frontend/src/app/api/classify/route.ts` — _à vérifier, hors scope agents_ |

#### Scripts utilitaires

| Script                                              | Rôle                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `scripts/list-agents.ts`                            | Liste les agents du projet Letta Cloud (debug)                        |
| `scripts/register-metadata-validator-tool.ts`      | Enregistre l'outil `validate_metadata_ri` sur l'agent Letta Cloud     |
| `scripts/update-metadata-schema-block.ts`          | Pousse le bloc mémoire `metadata_schema` à partir de `METADATA_SCHEMA_SPEC` |

### A.8 Variables d'environnement Letta Cloud

| Variable                  | Valeur par défaut                                             | Source                       |
| ------------------------- | ------------------------------------------------------------- | ---------------------------- |
| `LETTA_API_KEY`           | _secret_                                                      | `.env.local`                 |
| `LETTA_BASE_URL`          | `https://api.letta.com`                                       | `.env.local`                 |
| `LETTA_PROJECT_ID`        | `project-pZvdCSjhJ7Fgmi66gqgy` (prod) / `97c52a94-…` (default) | `.env.local`                 |
| `PLAYGROUND_AGENT_ID`     | _non défaut_                                                  | `.env.local`                 |
| `LETTA_AGENT_AR`          | `agent-c19d4b57-048c-48a7-8cdc-9609dab4b24b`                  | `packages/shared/.../languages.ts` |
| `LETTA_AGENT_UK`          | `agent-add8dcc9-5d2e-4461-aa00-4bfcfe192b59`                  | `packages/shared/.../languages.ts` |
| `LETTA_AGENT_RU`          | `agent-4d7f539b-797b-4b5c-9755-cdffec5cc9f7`                  | `packages/shared/.../languages.ts` |

---

## B. Setup 2 — Agent Letta Code (cible de la migration, scaffoldé pour RCO)

> Ce setup est **scaffoldé** dans le repo (mémoire + commands + skills existent) mais **n'est pas branché en production** aujourd'hui. Il consomme du **RCO XML (Lhéo)** et cible un agent nommé "Agathe". RCO n'étant plus la source de données active (la prod utilise maintenant l'API Data Inclusion → markdown), ce setup est en sommeil mais **doit être conservé** : RCO redeviendra pertinent à terme (cf. contrainte 2).

### B.1 Identité de l'agent

| Élément        | Valeur                                                                                | Source                                          |
| -------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Persona        | **Agathe**                                                                            | `.commands/*.md` (toutes les commandes)         |
| Format d'entrée| **RCO XML (Lhéo)** — non utilisé en prod aujourd'hui, prévu pour un futur mode d'ingestion RCO | `.commands/*.md` (toutes les commandes)         |
| Localisation   | `.agents/` (config), `.commands/` (slash commands), `.skills/` (skills)              | Racine du repo                                  |

> 📌 **Distinction des deux flux** :
> - **Flux de production actuel** : Letta Cloud + markdown (cf. Section A).
> - **Flux scaffoldé** : Letta Code + RCO XML (cf. Section B). Il sera pertinent dès que RCO redeviendra une source d'ingestion. Le travail de migration doit **préserver ce setup** (ne pas supprimer les `.commands/*.md` ni `.skills/metadata/`) même s'il n'est pas actif en prod.

### B.2 Blocs mémoire (`.agents/memory/system/`)

| Fichier            | Contenu                                                              | Taille |
| ------------------ | -------------------------------------------------------------------- | ------ |
| `persona.md`       | Règles comportementales (FP, raw SQL, pnpm, kebab-case, etc.)         | 21 l.  |
| `project.md`       | Architecture, patterns, statut POC, PR history insights               | 54 l.  |
| `luis.md`          | Profil de Luis (CTO) — préférences, focus, décisions récentes        | 25 l.  |
| `jeremie.md`       | Profil de Jérémie (full-stack) — focus, contributions, prochain chantier | 24 l. |
| `mcp_servers.md`   | Recommandations de serveurs MCP (Supabase, GitHub, MD, Vercel)        | 23 l.  |

> ✅ Contrairement au setup Letta Cloud, **tous** les blocs mémoire sont versionnés dans le repo. C'est précisément le pattern que la migration Letta Cloud → Letta Code doit viser.

### B.3 Slash commands (`.commands/`)

| Commande   | Description                                                          | Format entrée | Source                          |
| ---------- | -------------------------------------------------------------------- | ------------- | ------------------------------- |
| `audit.md` | Audit de conformité éditoriale et détection de doublons              | XML           | `.commands/audit.md`            |
| `redaction.md` | Transformation d'une fiche RCO en langage clair (A1/A2)            | XML           | `.commands/redaction.md`        |
| `metadata.md` | Mapping des métadonnées RCO XML au format Réfugiés.info            | XML           | `.commands/metadata.md`         |
| `pipeline.md` | Exécution de la pipeline complète (Audit → Rédaction → Métadonnées) | XML         | `.commands/pipeline.md`         |

> Les 3 premières commands **mappent 1:1** aux slash commands Letta Cloud (`/audit`, `/redaction`, `/metadata`). `pipeline.md` est une **commande composée** qui n'a pas d'équivalent direct côté Letta Cloud.

### B.4 Skills (`.skills/`)

| Skill             | Description                                                  | Scripts                                         | Source                                              |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------------- | --------------------------------------------------- |
| `metadata`        | Mapping Carif-Oref (RCO) XML → Réfugiés.info structured metadata | `scripts/map-metadata.ts` (182 lignes)         | `.skills/metadata/SKILL.md` + `.skills/metadata/scripts/` |

> Le skill `metadata` actuel **ne fait pas appel à un LLM** — c'est un script TypeScript de transformation déterministe qui :
> 1. Parse le XML RCO (Lhéo) avec `packages/rco/src/lheo.ts`.
> 2. Applique des règles de conversion (PUBLIC_STATUS_MAP, FINANCEURS_PUBLICS, FRENCH_LEVELS) en constantes inline dans le script.
> 3. Produit un frontmatter YAML `metadata_ri` + tableau de traçabilité.
>
> C'est intéressant car cela démontre la viabilité d'un skill **déterministe** (pas besoin d'agent IA pour cette étape), ce qui correspond exactement à la vision du PR 16 ("Introduire une abstraction de runtime agent") et au PR 18 ("validation déterministe des métadonnées RI"). Le pattern est à dupliquer pour le flux de prod (markdown) avec un script équivalent qui travaillerait sur le frontmatter YAML en entrée.

### B.5 Outils / scripts

| Script                                     | Rôle                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `.skills/metadata/scripts/map-metadata.ts` | Lit un XML RCO, applique des règles de mapping, produit un frontmatter YAML `metadata_ri` |
| `packages/rco/src/lheo.ts` (helper)        | `parseLheoXml()` — parser XML Lhéo utilisé par `map-metadata.ts`                       |

> Aucun outil applicatif HTTP exposé (contrairement au setup Letta Cloud) — les skills accèdent directement au système de fichiers.

### B.6 Ressources / données de référence

| Fichier                                                                  | Usage                                                                |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `.skills/metadata/SKILL.md`                                              | Description du skill + table de conversion `public`                  |
| `.skills/metadata/scripts/map-metadata.ts` (constantes inline)           | Tables de conversion `PUBLIC_STATUS_MAP`, `FINANCEURS_PUBLICS`, `FRENCH_LEVELS` |
| `packages/rco/src/lheo-types.ts`                                         | Types TypeScript du format Lhéo                                      |
| `packages/rco/src/lheo.ts`                                               | Parser Lhéo                                                           |

> 📌 **Référence manquante** : la SKILL.md mentionne `ressources_metadatas/base-connaissance.md` qui **n'existe pas** dans le repo. Décision Luis (15 juin 2026) : **laisser manquant**, ne pas recréer. Luis se charge de vérifier auprès de l'équipe RI si la base de connaissance est toujours pertinente. Si oui, recréer ; si non, mettre à jour la SKILL.md pour retirer la référence.

---

## C. Mapping migration (Letta Cloud → Letta Code)

### C.1 Correspondances directes

| Élément Letta Cloud (source)                                | Élément Letta Code cible                                      | Statut |
| ----------------------------------------------------------- | ------------------------------------------------------------- | ------ |
| Agent multi-tâches (`PLAYGROUND_AGENT_ID`)                  | Agent Letta Code "Agathe" (à créer/configurer)                 | ⏳ à faire |
| Agent de traduction `ar/ru/uk`                              | Skill de traduction multilingue (RI-1270/PR 13–15)            | ⏳ à faire |
| Bloc mémoire `metadata_schema`                              | `MEMORY.md` ou `SKILL.md` du skill metadata (RI-1259)          | ⏳ à faire |
| Bloc mémoire `compliance` + `doublons`                      | Skill `audit` (RI-1264/PR 09)                                  | ⏳ à faire |
| Slash command `/audit` (constante `AUDIT_SLASH_COMMAND`)     | `.commands/audit.md` (existe déjà) → à enrichir                 | 🟡 partiel |
| Slash command `/redaction` (`REDACTION_SLASH_COMMAND`)      | `.commands/redaction.md` (existe déjà) → à enrichir             | 🟡 partiel |
| Slash command `/metadata` (`METADATA_SLASH_COMMAND`)        | `.commands/metadata.md` (existe déjà) → à enrichir              | 🟡 partiel |
| Slash command `/translate` (`TRANSLATE_SLASH_COMMAND`)      | Skill de traduction multilingue (à créer)                      | ⏳ à faire |
| Outil `validate_metadata_ri` (HTTP route)                   | Tool Letta Code (PR 18)                                        | ⏳ à faire |
| Outil `search_ri_duplicate_dispositifs` (client API karfur) | Tool Letta Code **réécrit** comme requête Supabase (PR 20)     | ⏳ à faire |
| Script `scripts/update-metadata-schema-block.ts`            | Poussée auto du bloc mémoire au runtime Letta Code (PR 22) — _inutile depuis le gel_ | ⏳ obsolète |
| Script `scripts/register-metadata-validator-tool.ts`        | Enregistrement du tool au runtime Letta Code (PR 18)           | ⏳ à faire |

### C.2 Format d'entrée : décision actée

- **Flux de production (actuel)** : **markdown (YAML frontmatter + corps texte)**, issu de l'API Data Inclusion (structures + services). C'est ce que consomme `packages/agents/` et que les workflows envoient à l'agent Letta Cloud.
- **Flux scaffoldé pour RCO (futur)** : **RCO XML (Lhéo)**, qui redeviendra pertinent à terme (cf. contrainte 2). Le setup Letta Code actuel dans `.commands/` et `.skills/metadata/` est taillé pour ce format.

> **Décision** : la migration doit supporter **les deux formats** :
> - Les nouveaux skills Letta Code de la prod (audit, redaction, metadata, translate) doivent consommer du **markdown** (et utiliser les helpers existants dans `packages/agents/`).
> - Les skills scaffoldés pour RCO XML (`.commands/*.md`, `.skills/metadata/`) sont **conservés tels quels** pour la reprise future. Quand RCO redeviendra actif, on aura un agent Letta Code déjà pré-câblé pour ce format.
>
> En pratique, cela veut dire que la migration ne "réécrit" pas la section B — elle l'enrichit avec une famille de skills "markdown" et conserve la famille "RCO XML" en l'état.

### C.3 Pattern de blocs mémoire

Le projet `project-pZvdCSjhJ7Fgmi66gqgy` a 3 blocs uploadés (cf. Section A.4) — tous **gelés** depuis la dépréciation des "File" resources par Letta (contrainte 1). Les fichiers sources existent dans le repo mais ne peuvent plus être pushés vers l'agent en prod. ⚠️ **Ces 3 blocs sont orphelins** : 0 agent actif dans ce projet (cf. B.1). Les 6 agents de prod (dans `97c52a94-…`) ont **0 memory block attaché** et vivent uniquement de leur `system` prompt.
Le setup Letta Code a 5 blocs (cf. Section B.2) — **tous commités dans le repo** et modifiables à volonté.

> **Recommandation** : la migration doit **basculer la prod sur le pattern Letta Code** (blocs commités et modifiables localement). Le pattern "uploader vers Letta Cloud" n'est plus viable — il faut s'appuyer sur Letta Code + qmd (corpus local) pour la prochaine itération.

---

## D. Implications pour les PR suivants (référence rapide)

| PR | RI         | Impact sur l'inventaire                                                |
| -- | ---------- | ---------------------------------------------------------------------- |
| 02 | RI-1259    | Le corpus `documentation/agent-migration/agent-knowledge/` doit héberger les futurs skills versionnés. |
| 03 | RI-1260    | Exporter les 3 prompts Letta Cloud (`metadata_schema`, `compliance`, `doublons`) en Markdown versionné. Note : ces sources ne sont plus jamais pushables en prod (gel) — la valeur du PR est de **basculer le pattern de mise à jour** (commits git au lieu d'upload dashboard). |
| 04 | RI-1261    | Extraire les 5 fichiers `.agents/memory/system/*.md` dans le corpus, avec qmd. |
| 05 | RI-1262    | Indexer le corpus dans qmd.                                             |
| 06 | RI-1263    | Convertir `.commands/*.md` (RCO XML) en skills — **conserver tels quels** pour la future reprise RCO. La migration ajoute **en parallèle** une famille de skills "markdown" pour la prod. |
| 09 | RI-1264    | Skill `audit` (markdown) : reprendre les prompts `compliance.md` + `duplicates.md` + tool `search_ri_duplicate_dispositifs` réécrit en requête Supabase (PR 20). |
| 10 | RI-1265    | Skill `redaction` (markdown) : reprendre le slash command `/redaction`. |
| 11 | RI-1266    | Skill `metadata` (markdown) : reprendre la logique de `.skills/metadata/` (réécrit pour frontmatter YAML au lieu de XML) + tool `validate_metadata_ri` (PR 18). |
| 13 | RI-1268    | Skill `translation` multilingue : reprendre les **5 agents** `ar/uk/ru/ps/ti` (considérer 1 agent multilingue vs 5). `ps` et `ti` ont déjà la persona Letta Code standard — probablement un pré-déploiement. |
| 18 | RI-1274    | Tool `validate_metadata_ri` (déjà HTTP route Next.js) — le réexposer en tool Letta Code. |
| 20 | RI-1276    | Tool `search_ri_duplicate_dispositifs` — **ne pas** se contenter d'extraire le client karfur : réécrire comme requête Supabase déterministe sur la table `dispositifs` (matching fuzzy + sémantique). |
| 22 | RI-1278    | `scripts/update-metadata-schema-block.ts` devient obsolète (cf. gel). À supprimer ou transformer en script de validation locale. |
| 23 | RI-1278    | Squelette du runtime Letta Code.                                       |
| 24–28 | RI-1279–RI-1283 | Brancher les 4 skills sur le runtime Letta Code.                  |
| 29 | RI-1284    | Worker Cloud Run pour le runtime.                                      |

---

## Annexe A — Liste consolidée des fichiers inventoriés

### Production (Letta Cloud)
- `packages/agents/src/{clients,agents,ingestion,simplification,metadata,parser,schemas,types,prompts,index}.ts`
- `packages/agents/prompts/{compliance,duplicates}.md`
- `packages/agents/samples/{dispositifs.json,dispositifs.yaml}`
- `packages/agents/src/metadata-schema-spec.ts`
- `packages/shared/src/constants/languages.ts`
- `packages/workflows/src/pipelines/ingestion/di-ingestion.ts` _(cron pipeline)_
- `packages/workflows/src/pipelines/ingestion/di-single-record.ts` _(per-record child workflow)_
- `packages/workflows/src/steps/ingestion/di-single-record-steps.ts` _(fan-out + `diSingleAuditStep` + `diSingleMetadataStep`)_
- `packages/workflows/src/steps/ingestion/ingest-di.ts` _(steps 1–3, no LLM)_
- `packages/workflows/src/steps/ingestion/{audit,metadata}-di-step.ts` _(legacy/force wrappers)_
- `packages/workflows/src/steps/editorial/force-editorial-step.ts`
- `packages/workflows/src/steps/translation/{generate-translation,get-available-translation-agents}.ts`
- `apps/frontend/src/app/api/tools/validate-metadata-ri/route.ts`
- `apps/frontend/src/app/api/editorial-rewrite/route.ts`
- `apps/frontend/src/app/api/editorial-rewrite/[runId]/route.ts`
- `apps/frontend/src/app/api/agents/metadata/stream/route.ts`
- `scripts/{list-agents,register-metadata-validator-tool,update-metadata-schema-block}.ts`

### Expérimental (Letta Code)
- `.agents/memory/system/{persona,project,luis,jeremie,mcp_servers}.md`
- `.commands/{audit,redaction,metadata,pipeline}.md`
- `.skills/metadata/SKILL.md`
- `.skills/metadata/scripts/map-metadata.ts`
- `packages/rco/src/{lheo,lheo-types}.ts`

### Documentation produite
- `documentation/agent-migration/README.md`
- `documentation/agent-migration/letta-cloud-inventory.md` ← _ce fichier_

---

## Annexe B — Audit live de l'organisation Playground (Letta Cloud, 2026-06-15)

> Audit réalisé via `GET /v1/agents`, `/v1/agents/{id}`, `/v1/projects`, `/v1/tools`, `/v1/blocks` sur `https://api.letta.com` avec le `LETTA_API_KEY` de l'organisation.
> **Read-only** : aucune modification n'a été faite.

### B.1 Projets

| ID | Nom | Rôle | Contenu |
|----|-----|------|---------|
| `97c52a94-4e58-4226-9ac3-b000d1dcba78` | Default Project | **Production agents** (Agathe + 5 traducteurs) + outils | 6 agents, 25+ tools, 0 blocks |
| `project-pZvdCSjhJ7Fgmi66gqgy` | _(non nommé)_ | Orphelin : hébergeait des agents Letta Code archivés (Jasmine/Karfur ?) | **0 agents**, 30+ memory blocks orphelins |

> ⚠️ L'env `LETTA_PROJECT_ID` (variable `project-pZvdCSjhJ7Fgmi66gqgy`) est en fait un projet **vide côté agents**. Les agents de prod actifs vivent dans le **default project** `97c52a94-…`. À investiguer.

### B.2 Agents en production (6, tous dans `97c52a94-…`)

| Nom | Agent ID | Modèle | Créé | Mis à jour | System prompt | Tools | Memory blocks |
|-----|----------|--------|------|------------|---------------|-------|----------------|
| **Agathe** (multi-tâches) | `PLAYGROUND_AGENT_ID=<REDACTED>` ⚠️ placeholder | `anthropic/claude-sonnet-4-6` | 2026-01-07 | 2026-06-15 | 4164 chars (base + section MemFS) | 0 | 0 |
| `traducteur_ar` | `agent-c19d4b57-048c-48a7-8cdc-9609dab4b24b` | `anthropic/claude-haiku-4-5` | 2026-01-22 | 2026-06-02 | 1707 chars (base par défaut) | 0 | 0 |
| `traducteur_uk` | `agent-add8dcc9-5d2e-4461-aa00-4bfcfe192b59` | `anthropic/claude-haiku-4-5` | 2026-01-26 | 2026-06-02 | 1707 chars (base par défaut) | 0 | 0 |
| `traducteur_ru` | `agent-4d7f539b-797b-4b5c-9755-cdffec5cc9f7` | `anthropic/claude-haiku-4-5` | 2026-02-11 | 2026-06-02 | 1707 chars (base par défaut) | 0 | 0 |
| `traducteur_ps` | `agent-42fb380d-5920-437f-b2f3-57d02af4c6a7` | `anthropic/claude-sonnet-4-6` | 2026-06-02 | 2026-06-02 | 9301 chars (persona Letta Code) | 0 | 0 |
| `traducteur_ti` | `agent-00b19760-f018-42a8-81d0-1c777b31bf7b` | `anthropic/claude-sonnet-4-6` | 2026-06-02 | 2026-06-02 | 9301 chars (persona Letta Code) | 0 | 0 |

**Observations importantes :**

- **3 générations d'agents** sont visibles :
  1. **ar/uk/ru** (jan-fév 2026) — créés avec `claude-haiku-4-5`, system prompt minimal, _anciens_
  2. **Agathe** (jan 2026, mis à jour en juin) — base + section MemFS, _sert toujours_
  3. **ps/ti** (2 juin 2026) — `claude-sonnet-4-6`, persona complète Letta Code, _réécriture récente_ (sans doute dans le cadre de la migration)
- **Aucun agent n'a de tool attaché** — la logique applicative passe par le code `packages/agents/src/*` + les ressources fichiers gelées.
- **Aucun agent n'a de memory block attaché** — la personnalité vit dans le `system` prompt.
- Le modèle a changé entre générations : haiku-4-5 (vieux) → sonnet-4-6 (récent).

### B.3 Outils disponibles dans `97c52a94-…` (25+, 0 attaché)

| Outil | Type | Note migration |
|-------|------|----------------|
| `search_ri_duplicate_dispositifs` | **Custom RI** | ⚠️ Client karfur (cf. A.5, contrainte 3) — réécrire en PR 20 |
| `validate_metadata_ri` | **Custom RI** | OK (route Next.js) — réexposer en tool Letta Code en PR 18 |
| `ReadManyFiles` | Standard | — |
| `WriteTodos` | Standard | — |
| `SearchFileContent` | Standard | — |
| `Replace` | Standard | — |
| `WriteFileGemini` | Standard | — |
| `ListDirectory` | Standard | — |
| `ReadFileGemini` | Standard | — |
| `GlobGemini` | Standard | — |
| `RunShellCommand` | Standard | — |
| `analyze_text` | Standard | — |
| 13 outils GitHub MCP (`update_pull_request`, `merge_pull_request`, `search_code`, `pull_request_review_write`, etc.) | GitHub MCP | _probablement pour l'agent codex/gemini_ |

> Les 13 outils GitHub MCP sont sans `project_id` (non scopés) — ce sont probablement des outils globaux au workspace.

### B.4 Memory blocks orphelins dans `project-pZvdCSjhJ7Fgmi66gqgy` (30+)

| Label | Taille | Hypothèse |
|-------|--------|-----------|
| `persona` × plusieurs (506 → 10 053 chars) | variable | Identités de différents agents Letta Code archivés |
| `human` × plusieurs | variable | Profils humains des agents archivés |
| `project` | 186 chars | Contexte projet partagé |
| `skills` | 60 chars | Index des skills |
| `research_citations` | 0 chars | (vide) |
| `research_plan` | 0 chars | (vide) |
| `Output Format` × plusieurs | 1 344 chars | Schéma de sortie des agents archivés |
| `Persona` × plusieurs | 1 865 → 5 772 chars | Personas archivés |
| `analyse_30_formations_lheo` | 16 025 chars | **Données runtime** issues d'une passe RCO XML (30 formations Lhéo) |
| `deduplication_report_30_lheo` | 6 542 chars | **Données runtime** issues d'une passe de dédup RCO |
| `xml_data_extracted` | 849 chars | Données extraites de RCO XML |
| `mission` × plusieurs | 325 → 3 939 chars | Prompts mission des agents archivés |
| `output_format` × plusieurs | 69 → 2 720 chars | Variantes de format de sortie |

> **Hypothèse** : ce projet hébergeait les agents Letta Code archivés (probablement le `Jasmine - Karfur` vu dans le listing local, ou un Agathe-RCO qui a été décommissionné). Les blocs runtime `analyse_30_formations_lheo` et `deduplication_report_30_lheo` suggèrent qu'un **agent RCO XML a tourné sur 30 fichiers Lhéo en production** et laissé ses traces. **À nettoyer** quand la migration Letta Code sera stabilisée.

### B.5 Conclusions de l'audit

1. **La cible « Letta Code + qmd » est en cours de pré-déploiement** : les agents `traducteur_ps` et `traducteur_ti` (créés le 2 juin 2026) ont déjà la **persona Letta Code standard** (`You are Letta Code, a Letta agent…`). C'est cohérent avec le timing du projet de migration.
2. **L'agent Agathe a été re-touché récemment** (updated_at = 2026-06-15) — sa system prompt inclut une section MemFS qu'il n'avait probablement pas avant. Probablement un autre préparatif de migration.
3. **L'architecture est plus minimaliste que ce que je pensais** : aucun tool, aucun memory block, aucune identity block sur les 6 agents. Tout vit dans le `system` prompt + les ressources fichiers gelées + les slash command constants du code. C'est une excellente nouvelle pour la migration : la **surface de migration est petite** (juste 4 fichiers TS de prompts + 2 fichiers de prompts.md).
4. **Le projet `project-pZvdCSjhJ7Fgmi66gqgy` est mort** : 0 agents, 30+ blocs orphelins. À vider une fois la migration validée.
5. **Le bug d'ID `PLAYGROUND_AGENT_ID=<REDACTED>`** sur Agathe est réel — il faudra le recréer proprement pendant la migration (un nouvel ID sera attribué par l'API Letta Code).

---

_Dernière mise à jour : 2026-06-15 — par l'agent Letta Code, sur la base d'un audit du repo à la révision `9aa3bda` + d'un audit live de l'organisation Playground sur `api.letta.com`._
