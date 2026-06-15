# `references/` — documentation de référence statique

Ce dossier contient des **docs de référence** que l'agent peut consulter à la demande (schéma d'API, tables de mapping, lexiques, etc.).

## Convention

- **Un fichier `.md` par sujet** : `data-inclusion-schema.md`, `language-codes.md`
- **Frontmatter obligatoire** : `description`, `audience` (`agent`, `human`, ou `both`)
- **Champ `source`** recommandé : URL ou chemin de la source canonique
- **Pas de duplication** : si l'info vit déjà dans `packages/shared/` ou `packages/agents/schemas/`, on **référence** (lien relatif) au lieu de copier

## Statut

| Fichier                       | Source                                        | Rempli par        |
|-------------------------------|-----------------------------------------------|-------------------|
| `data-inclusion-schema.md`    | Schéma de l'API Data Inclusion (structures + services) | PR-02 (scaffold)  |
| `language-codes.md`           | `packages/shared/src/constants/languages.ts`  | PR-02 (scaffold)  |

> Le pattern « pas de duplication » est clé : `references/data-inclusion-schema.md` ne duplique pas le schéma TypeScript — il **pointe** vers `packages/agents/src/metadata-schema-spec.ts` et n'ajoute que la documentation narrative (exemples, cas limites, glossaire).

## Différence avec `prompts/`

Une **référence** = ce que l'agent *peut lire* pour comprendre un domaine.
Un **prompt** = ce qu'on *dit* à l'agent pour le piloter.

Les deux sont en markdown, mais une référence est typiquement de la doc technique, un prompt est une consigne d'exécution.
