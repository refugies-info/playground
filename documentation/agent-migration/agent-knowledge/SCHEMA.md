# Schéma de frontmatter — corpus `agent-knowledge`

> Ce schéma est **validé par `pnpm validate:corpus`** (script ajouté par PR-02 / RI-1259).

## Champs communs (tous les fichiers `.md` du corpus)

```yaml
---
description: <string, obligatoire, une ligne>    # Utilisé par qmd pour l'indexation
audience: [agent|human|both]                       # Obligatoire. Qui lit ce fichier
last-reviewed: <YYYY-MM-DD>                        # Optionnel. Dernière revue humaine
---
```

`description` est la **seule** information que l'agent a en mode « prévisualisation » (qmd search, grep). Elle doit être **suffisante à elle seule** pour que l'agent sache s'il doit charger le fichier complet.

## Par type de fichier

### Skill — `corpus/skills/<nom>/SKILL.md`

Conventions Letta Code (compatibles avec le format `~/.letta/agents/{id}/memory/skills/*/SKILL.md`) :

```yaml
---
name: <skill-name>                                 # Obligatoire, kebab-case
description: <one-line>                            # Obligatoire
audience: agent                                    # Toujours "agent" pour un skill
inputs:                                            # Optionnel, mais recommandé
  - name: <input-name>
    type: <string|object|markdown|yaml|json>
    description: <one-line>
outputs:                                           # Optionnel
  - name: <output-name>
    type: <string|object|markdown|yaml|json>
    description: <one-line>
last-reviewed: <YYYY-MM-DD>                        # Optionnel
---

<contenu markdown du skill>
```

**Règles** :

- `name` doit correspondre au nom du dossier parent (kebab-case)
- Le fichier **doit** s'appeler `SKILL.md` (en majuscules, convention Letta Code)
- Pas de frontmatter `id`/`version` — git fournit l'historique

### Prompt — `corpus/prompts/<nom>.md`

```yaml
---
description: <one-line>                            # Obligatoire
audience: agent                                    # Toujours "agent"
length-budget: <nombre-de-tokens>                  # Optionnel, budget max pour ce prompt
source: <provenance>                               # Optionnel — ex: "Exported from Letta Cloud
                                                      agent agent-c19d4b57-…, 2026-06-15"
last-reviewed: <YYYY-MM-DD>                        # Optionnel
---

<contenu markdown du prompt>
```

### Référence — `corpus/references/<nom>.md`

```yaml
---
description: <one-line>                            # Obligatoire
audience: [agent|human|both]                       # Obligatoire
source: <URL|chemin-relatif>                       # Optionnel, source canonique
last-reviewed: <YYYY-MM-DD>                        # Optionnel
---

<contenu markdown de la référence>
```

### Exemple — `corpus/examples/<skill>/<nom>.md`

```yaml
---
description: <one-line>                            # Obligatoire
audience: agent                                    # Toujours "agent"
inputs:                                            # Optionnel, recommandé
  - name: <input-name>
    type: <type>
    value: <exemple de valeur>                     # Optionnel — exemple concret
outputs:                                           # Optionnel
  - name: <output-name>
    type: <type>
    value: <exemple de valeur>
last-reviewed: <YYYY-MM-DD>                        # Optionnel
---

<corps de l'exemple — peut être un dialogue, une fiche avant/après, etc.>
```

## Règles de nommage

- **Tout en kebab-case** : `audit-de-doublons.md`, pas `audit_de_doublons.md`
- **Pas d'accents** dans les noms de fichiers (ASCII only)
- **Pas de dates dans les noms** : c'est le rôle de `last-reviewed` et de git
- **Maximum 64 caractères** pour un nom de fichier (lisibilité terminal)

## Validation stricte vs warn

| Règle                                            | Sévérité |
|--------------------------------------------------|----------|
| `description` manquant                           | **fail** |
| `description` > 200 caractères                   | warn     |
| `name` du skill ≠ nom du dossier                 | **fail** |
| `name` du skill pas en kebab-case                | **fail** |
| Lien relatif cassé (404 dans le repo)            | warn     |
| Skill sans exemple ni référence                  | warn     |
| `last-reviewed` absent et fichier > 90 jours     | warn     |

**Sévérité fail** = le CI refuse le merge.
**Sévérité warn** = affiché en sortie, n'empêche pas le merge.
