# Letta Cloud — audit live du 15 juin 2026 (ressources exhaustives)

> Audit réalisé via l'API Letta Cloud (production, `https://api.letta.com`)
> avec le `LETTA_API_KEY` du fichier `playground/main/.env.local`.
> Date : 2026-06-15
> **Read-only** : aucune modification n'a été faite.

## TL;DR — 4 types de ressources

| Type            | Compte | Localisation                    | API            | Statut migration |
| --------------- | ------ | ------------------------------- | -------------- | ---------------- |
| **Agents**      | 6      | default project `97c52a94-…`    | `/v1/agents`   | ✅ Identique à l'inventaire A.2 |
| **Tools**       | 50     | default project `97c52a94-…`    | `/v1/tools/`   | ✅ Identique à l'inventaire B.3 (12 custom + 38 GitHub MCP) |
| **Memory blocks** | 50+ | orphelin `project-pZvdCSjhJ7Fgmi66gqgy` + workspace templates | `/v1/blocks` | ⚠️ **Étendu** : 3 blocs "gelés" (PR-03) + 30+ orphelins (à nettoyer) + ~50+ templates workspace |
| **Filesystem folders** | 10 (visibles UI) | default project `97c52a94-…` | **agent-level export** (cf. §4) | ✅ **RÉSOLU** : 13 fichiers exportés via `GET /v1/agents/{id}/export` (cf. `scripts/export-letta-agent-knowledge.ts`, porté de karfur PR #3788) |

## 1. Agents (6)

| ID                                    | Nom              | Modèle                          |
| ------------------------------------- | ---------------- | ------------------------------- |
| `agent-bd…` (PLAYGROUND_AGENT_ID)     | Agathe           | `anthropic/claude-sonnet-4-6`   |
| `agent-c1…`                           | traducteur_ar    | `anthropic/claude-haiku-4-5`    |
| `agent-ad…`                           | traducteur_uk    | `anthropic/claude-haiku-4-5`    |
| `agent-4d…`                           | traducteur_ru    | `anthropic/claude-haiku-4-5`    |
| `agent-42…`                           | traducteur_ps    | `anthropic/claude-sonnet-4-6`   |
| `agent-00…`                           | traducteur_ti    | `anthropic/claude-sonnet-4-6`   |

→ Identique à l'inventaire Annexe B.2. Aucun agent n'a de tool ou de memory block attaché. Tout vit dans le `system` prompt + les ressources fichiers gelées.

## 2. Tools (50)

- **12 custom RI** (dont `search_ri_duplicate_dispositifs`, `validate_metadata_ri`, et 10 standard)
- **38 GitHub MCP** (`update_pull_request`, `merge_pull_request`, `search_code`, etc. — workspace-wide)

→ Identique à l'inventaire Annexe B.3. Aucun n'est attaché à un agent.

## 3. Memory blocks (50+)

### 3.1 Blocs "gelés" de production (PR-03 — 3 blocs)

| Label                                          | Taille   | Localisation                    |
| ---------------------------------------------- | -------- | ------------------------------- |
| `system/metadata_schema`                       | 4 760 chars | workspace (project_id: null) |
| `system/compétence_conformité_éditoriale_di`   | 5 284 chars | workspace (project_id: null) |
| `system/compétence_détection_doublons`         | 3 778 chars | workspace (project_id: null) |

→ Ce sont les **3 blocs exportés par PR-03** (`scripts/export-letta-cloud-blocks.ts`).

### 3.2 Blocs orphelins (30+ — Annexe B.4 du PR-01)

50 blocs dans le projet orphelin `project-pZvdCSjhJ7Fgmi66gqgy` :
- 13 `persona` (506 → 10 053 chars)
- 7 `human` (86 → 385 chars)
- 7 `project` (186 chars)
- 6 `Output Format` / `OUTPUT_FORMAT` (1 344 / 2 720 chars)
- 6 `Persona` (1 865 / 5 772 chars)
- 4 `MISSION` (7 817 chars) — **données runtime RCO**
- 2 `mission` (3 939 chars)
- 2 `compétence_*` (RCO-skill, 1 577 / 1 995 chars)
- Données runtime : `analyse_30_formations_lheo` (16 025 chars), `deduplication_report_30_lheo` (6 542 chars), `xml_data_extracted` (849 chars), `memory_audit_analysis` (3 260 chars), `draft_optimized_blocks` (5 022 chars)
- 1 `compliance_guidelines` (5 674 chars), 2 `compliance_guidelines` (5 714 chars) — 3 occurrences
- 1 `compliance_decision_framework` (1 146 chars)
- 1 `refugies_info_compliance_guidelines` (5 715 chars)
- Skills RCO archivés : `compétence_routeur` (2 292 chars), `compétence_transformation_langage_clair` (2 417 chars), `règles_rédaction_langage_clair` (4 461 chars), `format_sortie_global` (2 352 chars), `format_sortie_transformation` (4 367 chars), `contexte_équipe` (1 468 chars), `team_context` (1 468 chars), `compétence_conformité_éditoriale_rco` (1 627 chars)

→ **À nettoyer** (cf. PR-01 Annexe B.5 #4), pas à exporter. Certains contiennent des **données runtime** de passes RCO archivées.

### 3.3 Templates workspace (50+)

51 `system/…` blocks trouvés dans le workspace (project_id: null) :
- `system/metadata_schema`, `system/compétence_conformité_éditoriale_di`, `system/compétence_détection_doublons` (les 3 de PR-03)
- `system/compétence_métadonnées_di` (9 365 chars)
- `system/compétence_routeur`, `system/compétence_transformation_langage_clair`
- `system/règles_rédaction_langage_clair`
- `system/format_sortie_global`, `system/format_sortie_transformation`, `system/format_sortie_metadonnées`, `system/format_fiche`
- `system/contexte_équipe`, `system/ressources`
- `system/processus_de_traduction`, `system/regles_editoriales`, `system/mémoire_vive_lexique`
- `system/consignes_traduction_ukrainien` (14 163 chars)
- 6 blocs `system/traduction_*` (FR→RU, ASL, OEPRE…)
- 4 blocs `system/project-*` (overview, architecture, tech-stack, conventions, commands, gotchas)
- 4 blocs `system/persona`
- 2 blocs `system/memory_filesystem`
- `system/human`, `system/luis`, `system/jeremie`, `system/tarjama_agent`
- … et d'autres.

→ Certains de ces templates (comme `system/compétence_métadonnées_di`) **pourraient être pertinents** à exporter dans la corpus. **À investiguer dans un PR ultérieur.**

## 4. Filesystem folders (10 visibles dans l'UI) — ⚠️ RÉSOLU via l'export agent

L'UI Letta Cloud (URL : `app.letta.com/projects/default-project/data-sources`) affiche 10 dossiers de données :

| Nom                                    | Agents attachés |
| -------------------------------------- | --------------- |
| `ressources_langage_clair`             | 3               |
| `ressources_jurisprudence`             | 0               |
| `ressources_metadatas`                 | 2               |
| `ressources_exemples_redaction`        | 1               |
| `Ressources traduction arabe`          | 1               |
| `ressources_traduction_uk`             | 1               |
| `ressources_conformité_éditori…`       | 1               |
| `Fiches étalon FR - UK`                | 1               |
| `ressources_traduction_ru`             | 1               |
| `Fiches étalon FR - RU`                | 1               |

**Problème initial** : l'API `/v1/folders/`, `/v1/folders/{id}`, `/v1/folders/{id}/files`, `/v1/agents/{id}/folders` retournent toutes **400 "This API route is deprecated and no longer supported on the Letta API"**. Le SDK `@letta-ai/letta-client@1.10.2` appelle ces endpoints et échoue.

**Solution trouvée** : l'endpoint **`GET /v1/agents/{agent_id}/export`** (équivalent SDK `client.agents.exportFile(agentId)`) fonctionne et **expose tout le contenu attaché à l'agent** (fichiers + chunks + métadonnées), contournant complètement l'API folders dépréciée. L'export est sérialisé en JSON, puis normalisé en corpus versionné par `scripts/export-letta-agent-knowledge.ts` (porté de la PR #3788 du repo karfur, commit `ec219d8c7ff8c5c91e2cab517eea5f123147dc63`).

**État de l'export (2026-06-08, depuis la PR karfur 3788)** : 13 fichiers normalisés écrits dans le corpus :
- `langage-clair/` — 8 fichiers (charte, lexique, lexique DITP, cas éditoriaux, schéma fiche, guide annotation, personas BPI, process)
- `metadatas/` — 4 fichiers (mapping-data, mapping-data-di, base-connaissance, dispositif-letta)
- `conformite-editoriale/` — 2 fichiers (jurisprudence, Formacode)
- 6 fichiers exclus (qualité) — dont `ressources_exemples_redaction`
- 1 408 chunks indexés au total
- 0 alerte d'extraction faible

## 5. Implications pour la migration

### PR-03 (TEC-33, RI-1260) — status

- ✅ **3 blocs mémoire "gelés" exportables** via `scripts/export-letta-cloud-blocks.ts` (testé OK le 2026-06-15 avec le `LETTA_API_KEY` de `playground/main/.env.local`)
- ✅ Fichiers écrits dans `documentation/agent-migration/agent-knowledge/prompts/{metadata-schema,compliance,doublons}.md`
- ✅ **13 fichiers de corpus exportés** via `scripts/export-letta-agent-knowledge.ts` (porté de karfur PR #3788) — résout la question des 10 filesystem folders en contournant l'API dépréciée via l'endpoint agent-level
- ⏸️ **Suppression des fichiers locaux** (`packages/agents/prompts/compliance.md`, `packages/agents/prompts/duplicates.md`, `packages/agents/src/metadata-schema-spec.ts`) **conditionnée** au retour utilisateur sur l'ampleur du scope (3 blocs vs. tous les templates workspace).

### PRs à venir (à confirmer)

- **PR-04+** : export des autres templates workspace (`system/compétence_métadonnées_di`, `system/processus_de_traduction`, etc.) — au cas par cas
- **PR-??** : nettoyage des 30+ blocs orphelins dans `project-pZvdCSjhJ7Fgmi66gqgy` (à planifier après stabilisation de la migration)
- **PR-??** : recréation de l'agent Agathe (le `PLAYGROUND_AGENT_ID` est un placeholder à remplacer) + import du system prompt dans Letta Code

## Annexe — méthodes d'audit utilisées

```bash
# Agents
curl -s "https://api.letta.com/v1/agents" -H "Authorization: Bearer $LETTA_API_KEY"

# Tools
curl -s "https://api.letta.com/v1/tools/" -H "Authorization: Bearer $LETTA_API_KEY"

# Memory blocks
curl -s "https://api.letta.com/v1/blocks" -H "Authorization: Bearer $LETTA_API_KEY"
curl -s --get "https://api.letta.com/v1/blocks" \
  --data-urlencode "label_search=metadata_schema" \
  -H "Authorization: Bearer $LETTA_API_KEY"

# Filesystem (DÉPRÉCIÉ)
curl -s "https://api.letta.com/v1/folders/" -H "Authorization: Bearer $LETTA_API_KEY"
# → 400 "This API route is deprecated and no longer supported"
```
