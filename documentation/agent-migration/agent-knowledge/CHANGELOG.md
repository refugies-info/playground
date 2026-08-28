# Changelog — corpus `agent-knowledge`

> Une ligne par modification matérielle. Plus important que git log car destiné à l'humain qui prend le corpus en main.

## 2026-06-15 — Scaffold initial (PR-02 / RI-1259)

- Création de la structure `agent-knowledge/` (prompts, skills, references, examples, index.qmd)
- Définition du schéma de frontmatter (cf. `SCHEMA.md`)
- Ajout du script `pnpm validate:corpus` (validation frontmatter + liens)
- README + SCHEMA + CHANGELOG + corpus.config.yaml
- Skills `audit`, `redaction`, `metadata`, `translate` scaffoldés (vides — remplissage dans PR-09/10/11/13)
- Aucun contenu applicatif (les fichiers sont des stubs `.gitkeep`/`.gitkeep` + README explicatif)

## 2026-06-15 — Export Letta Cloud (PR-03 / RI-1260)

- Ajout du script `pnpm agent-knowledge:export` (porté de karfur PR #3788) qui récupère l'export complet de l'agent Agathe via `GET /v1/agents/{agent_id}/export`. Cet endpoint contourne l'API `/v1/folders/` et `/v1/files/` dépréciée côté serveur Letta Cloud.
- 13 fichiers de corpus exportés depuis Letta Cloud, normalisés dans 3 sous-dossiers :
  - `langage-clair/` — 8 fichiers (charte, lexique DITP, lexique Maison de la Sagesse, process éditorial, schéma fiche dispositif, guide annotation, personas BPI, cas éditoriaux — tous PDFs convertis en Markdown sauf le JSON)
  - `metadatas/` — 4 fichiers (mapping-data, mapping-data-di, base-connaissance, dispositif-letta)
  - `conformite-editoriale/` — 2 fichiers (jurisprudence, Formacode)
- 6 fichiers exclus (qualité) — dont `ressources_exemples_redaction` (revue qualité)
- 1 408 chunks indexés au total, 0 alerte d'extraction faible
- Manifeste de traçabilité `_export-manifest.json` (file_id, source_path, chunks, weak_extraction_reasons par fichier)
- 3 blocs de prompts "gelés" ajoutés à `prompts/` (`compliance.md`, `doublons.md`, `metadata-schema.md`) — issus de l'export direct des workspace templates Letta Cloud
- Tous les nouveaux fichiers `.md` exposent les champs `description` + `audience` requis par `pnpm validate:corpus` (en plus des champs de traçabilité Letta Cloud `source_id`, `file_id`, etc.)
- Script de migration `scripts/export-letta-cloud-blocks.ts` ajouté (exporte les 3 blocs mémoire workspace via `/v1/blocks?label_search=…`) — alternative au script agent-level pour les blocs non attachés
- README mis à jour avec la section "Export Letta Cloud" + nouvelle entrée dans `letta-cloud-audit-2026-06-15.md` § 4 (la dépréciation folders est contournée via l'export agent-level)
- `pnpm validate:corpus` passe : 0 erreur, 19 warnings (images manquantes dans `[personas] bpi.md` + skills non remplis — prévus PR-09+)
