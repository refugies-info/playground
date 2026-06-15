---
description: "Codes langues supportés par la prod (5 agents de traduction actifs : ar/uk/ru/ps/ti)"
audience: [agent, human]
source: packages/shared/src/constants/languages.ts
last-reviewed: 2026-06-15
---

# Codes langues

> **Source canonique** : `packages/shared/src/constants/languages.ts` (TypeScript, source of truth)

## Langues actives en prod

5 agents de traduction sont actifs sur Letta Cloud (cf. [inventaire](../../letta-cloud-inventory.md) annexe B.2) :

| Code | Langue            | Agent ID (Letta Cloud)         | Modèle             |
|------|-------------------|--------------------------------|--------------------|
| `ar` | Arabe             | `agent-c19d4b57-…`             | `claude-haiku-4-5` |
| `uk` | Ukrainien         | `agent-add8dcc9-…`             | `claude-haiku-4-5` |
| `ru` | Russe             | `agent-4d7f539b-…`             | `claude-haiku-4-5` |
| `ps` | Pashto            | `agent-42fb380d-…`             | `claude-sonnet-4-6` |
| `ti` | Tigrinya          | `agent-00b19760-…`             | `claude-sonnet-4-6` |

## Langues NON couvertes (sont dans `languages.ts` mais sans agent)

| Code | Langue            | État               |
|------|-------------------|--------------------|
| `en` | Anglais           | Pas d'agent (la source est déjà en français, traduction FR→EN jugée non prioritaire) |
| `fa` | Persan/Farsi      | Pas d'agent (volume insuffisant) |

> Si une fiche nécessite une traduction dans une langue sans agent, l'agent principal renvoie un message « traduction non disponible ».

## Conséquences pour l'agent

- Le skill `translate` (PR-13) doit valider que la langue cible est dans la liste des 5 actives avant de tenter la traduction
- Les **exemples** few-shot sont par langue : `corpus/examples/translate/{ar,uk,ru,ps,ti}/`
- Le pattern "5 agents vs 1 agent multilingue" est une décision à acter dans PR-13 — voir l'inventaire section D, PR-13

## Notes culturelles

- **Pashto (ps)** et **Tigrinya (ti)** utilisent des écritures non-latines (arabe modifié, ge'ez). Les exemples few-shot doivent utiliser la même écriture que la sortie attendue — l'agent ne translittère pas.
- Les agents `ps` et `ti` sont sur `claude-sonnet-4-6` (plus cher que `haiku`) — probablement pour des raisons de qualité sur des langues peu dotées en données d'entraînement.

## Voir aussi

- `prompts/compliance.md` — contient la règle de validation sur la longueur des traductions
- Skill `translate` (PR-13) — implémentation
