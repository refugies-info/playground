# `examples/` — paires input/output worked (few-shot)

Ce dossier contient des **exemples concrets** que les skills utilisent pour caler leur comportement (few-shot prompting, validation, tests de non-régression).

## Convention

- **Sous-dossiers par skill** : `examples/audit/`, `examples/redaction/`, etc.
- **Un fichier `.md` par exemple** : `fiche-valide.md`, `fiche-non-conforme.md`
- **Frontmatter obligatoire** : `description`, `audience: agent`, et idéalement `inputs` + `outputs`
- **Format du corps** : généralement une section `## Input` + une section `## Output` (ou similaire)

## Structure cible

```
examples/
├── audit/
│   ├── fiche-valide.md
│   ├── fiche-non-conforme.md
│   └── fiche-avec-doublons.md
├── redaction/
│   ├── fiche-a1.md
│   └── fiche-a2.md
├── metadata/
│   ├── mapping-public-status.md
│   └── mapping-financeurs.md
└── translate/
    ├── ar/
    │   ├── fiche-exemple.md
    │   └── termes-glossaire.md
    ├── uk/
    ├── ru/
    ├── ps/
    └── ti/
```

## Statut

🔲 **vide** — rempli par les PR-09, PR-10, PR-11, PR-13.

> Pour le skill `translate`, les exemples sont par langue (un sous-dossier par code langue) pour faciliter la maintenance (un locuteur natif peut relire un dossier sans bruit).
