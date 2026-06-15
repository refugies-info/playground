# `prompts/` — instructions pures pour l'agent

Ce dossier contient des **prompts bruts** exportés depuis Letta Cloud (mémoire `system` des agents, blocs `metadata_schema`/`compliance`/`doublons`). Pas de logique applicative, pas de tool : juste des instructions en markdown.

## Convention

- **Un fichier par prompt** : `metadata-schema.md`, `compliance.md`, `doublons.md`
- **Nom = rôle du prompt** (kebab-case)
- **Frontmatter obligatoire** : `description`, `audience: agent` (+ cf. [`../SCHEMA.md`](../SCHEMA.md))
- **Si le prompt vient de Letta Cloud** : ajouter le champ `source` avec l'ID de l'agent et la date d'export

## Statut

| Fichier              | Source                                    | Rempli par        |
|----------------------|-------------------------------------------|-------------------|
| `metadata-schema.md` | Bloc `metadata_schema` (projet orphan)    | PR-03 / RI-1260   |
| `compliance.md`      | Bloc `compliance` (projet orphan)        | PR-03 / RI-1260   |
| `doublons.md`        | Bloc `doublons` (projet orphan)           | PR-03 / RI-1260   |

> Les 3 blocs sources vivent dans le projet `project-pZvdCSjhJ7Fgmi66gqgy` côté Letta Cloud (cf. [inventaire](../../letta-cloud-inventory.md) annexe B.4) et ne sont plus jamais pushables en prod. Une fois exportés ici, ils sont versionnés et modifiables via git.

## Différence avec `skills/`

Un **prompt** = ce qu'on dit à l'agent.
Une **skill** = ce que l'agent peut faire (peut contenir des tools, des exemples, des références).

Un prompt peut être référencé depuis une skill (par chemin relatif), mais l'inverse est rare.
