# `skills/` — compétences invocables par l'agent

Chaque skill est un **dossier** contenant au minimum un `SKILL.md` et optionnellement des sous-dossiers `examples/`, `references/`, `scripts/`.

## Convention

- **Un dossier par skill** : `skills/<skill-name>/`
- **Nom en kebab-case** : `audit`, `redaction`, `metadata`, `translate`
- **Fichier obligatoire** : `SKILL.md` à la racine du dossier (majuscules, convention Letta Code)
- **Frontmatter obligatoire** sur `SKILL.md` : `name`, `description`, `audience: agent` (cf. [`../SCHEMA.md`](../SCHEMA.md))
- **Dossiers optionnels** :
  - `examples/` : paires input/output worked (few-shot)
  - `references/` : docs que la skill peut consulter
  - `scripts/` : code TypeScript/JavaScript appelé par la skill

## Skills actuelles (scaffold)

| Dossier         | Statut     | Rempli par        | Cible                              |
|-----------------|------------|-------------------|------------------------------------|
| `audit/`        | 🔲 vide    | PR-09 / RI-1264   | `/audit` — conformité + doublons   |
| `redaction/`    | 🔲 vide    | PR-10 / RI-1265   | `/redaction` — réécriture éditoriale |
| `metadata/`     | 🔲 vide    | PR-11 / RI-1266   | `/metadata` — mapping métadonnées (réimplémentation, pas un port de `.skills/metadata/` archivé) |
| `translate/`    | 🔲 vide    | PR-13 / RI-1268   | `/translate` — multilingue (5 langues) |

## Format du SKILL.md (résumé)

```yaml
---
name: audit
description: Audit de conformité éditoriale d'une fiche Dispositif (markdown)
audience: agent
inputs:
  - name: fiche-dispositif
    type: markdown
    description: Fiche Dispositif au format markdown (frontmatter YAML + corps)
outputs:
  - name: rapport-audit
    type: markdown
    description: Rapport listant les non-conformités éditoriales et les doublons probables
last-reviewed: 2026-06-15
---

# Skill `audit`

<contenu markdown du skill — quoi faire, comment, dans quel ordre>

## Étapes

1. **Lire** la fiche d'entrée
2. **Valider** la conformité (cf. `prompts/compliance.md`)
3. **Détecter** les doublons (cf. tool `search_ri_duplicate_dispositifs`)
4. **Produire** un rapport markdown

## Exemples

Voir `examples/audit-fiche-valide.md` et `examples/audit-fiche-non-conforme.md`.
```

> Le format complet est dans [`../SCHEMA.md`](../SCHEMA.md) — section « Skill ».
