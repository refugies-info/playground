---
description: Schéma de l'API Data Inclusion (structures + services) — le format d'entrée de la prod
audience: [agent, human]
source: packages/agents/src/metadata-schema-spec.ts
last-reviewed: 2026-06-15
---

# Schéma de l'API Data Inclusion

> **Source canonique** : `packages/agents/src/metadata-schema-spec.ts` (TypeScript, source of truth)
>
> Ce fichier est une **vue narrative** pour l'agent IA. Pour les détails de validation, l'agent doit se référer au code TypeScript (toujours à jour) ou au tool `validate_metadata_ri` (cf. PR-18 / RI-1274).

## Vue d'ensemble

L'API Data Inclusion expose deux types de ressources principales :

1. **Structures** (ex : associations, entreprises) — identifié par `id`
2. **Services** (ex : permanence d'accueil, cours de français) — identifié par `id`, lié à une structure par `structure_id`

Les deux sont consommés par la prod du playground sous forme de **fiches markdown** avec frontmatter YAML.

## Champs clés (frontmatter)

### Champs communs

| Champ             | Type       | Obligatoire | Description                                          |
|-------------------|------------|-------------|------------------------------------------------------|
| `id`              | string     | ✅          | Identifiant unique                                   |
| `type`            | enum       | ✅          | `structure` ou `service`                             |
| `titre`           | string     | ✅          | Titre de la fiche                                    |
| `slug`            | string     | ✅          | Slug URL-safe (kebab-case)                           |
| `statut`          | enum       | ✅          | `active`, `archive`, `brouillon`                     |
| `date_maj`        | ISO date   | ✅          | Date de dernière mise à jour (source)                |
| `date_creation`   | ISO date   | ❌          | Date de création                                     |
| `description`     | string     | ✅          | Description courte (1-2 phrases)                     |
| `tags`            | string[]   | ❌          | Tags thématiques                                     |

### Champs spécifiques aux services

| Champ                | Type     | Description                                       |
|----------------------|----------|---------------------------------------------------|
| `structure_id`       | string   | ID de la structure parente                        |
| `publics`            | string[] | Publics cibles (cf. `publics_beneficiaires`)      |
| `frais`              | enum     | `gratuit`, `payant`, `adhesion`                   |
| `adresse`            | object   | Adresse postale (cf. schéma BAN)                  |
| `contact`            | object   | Contact (email, téléphone, site)                  |
| `horaires`           | object   | Horaires d'ouverture                              |

## Conséquences pour l'agent

- L'agent qui valide une fiche doit **toujours** vérifier la cohérence `structure_id` (le service pointe vers une structure existante)
- L'agent qui réécrit une fiche doit **conserver** les champs techniques (`id`, `slug`, `date_maj`) et ne réécrire que `titre`/`description`/texte libre
- L'agent qui mappe les métadonnées (skill `metadata`) doit produire un frontmatter **conforme** à ce schéma

## Cas limites connus

- **Services sans structure** : rare mais possible (services en ligne). Dans ce cas, `structure_id` est `null` ou absent.
- **Descriptions trop longues** : la prod tronque à 200 caractères. L'agent réécriture doit viser 150-180 caractères.
- **Caractères spéciaux** : les fiches sont en markdown, pas en HTML. Pas de balises, juste des sauts de ligne et des liens `[texte](url)`.

## Outils associés

- `validate_metadata_ri` (tool Letta Code) : valide le frontmatter contre ce schéma
- `search_ri_duplicate_dispositifs` (tool Letta Code) : détecte les doublons probables sur les services

> Plus de détails dans `packages/agents/src/metadata-schema-spec.ts`.
