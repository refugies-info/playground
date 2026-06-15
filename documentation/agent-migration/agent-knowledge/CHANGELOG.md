# Changelog — corpus `agent-knowledge`

> Une ligne par modification matérielle. Plus important que git log car destiné à l'humain qui prend le corpus en main.

## 2026-06-15 — Scaffold initial (PR-02 / RI-1259)

- Création de la structure `agent-knowledge/` (prompts, skills, references, examples, index.qmd)
- Définition du schéma de frontmatter (cf. `SCHEMA.md`)
- Ajout du script `pnpm validate:corpus` (validation frontmatter + liens)
- README + SCHEMA + CHANGELOG + corpus.config.yaml
- Skills `audit`, `redaction`, `metadata`, `translate` scaffoldés (vides — remplissage dans PR-09/10/11/13)
- Aucun contenu applicatif (les fichiers sont des stubs `.gitkeep`/`.gitkeep` + README explicatif)
