# Metadata Mapping Flow

Ce document décrit le **flux complet des métadonnées** depuis l’IA jusqu’à la publication.

## Objectif
- Expliquer d’où viennent les métadonnées
- Décrire comment elles sont **validées**, **corrigées** et **surchargées**
- Clarifier ce qui est envoyé en **preview** et **publication**

---

## 1) Sources des métadonnées

### a) Métadonnées IA (letta_report)
Le rapport IA génère un objet `metadata_ri` stocké dans `letta_reports`.
Ce contenu est chargé par le frontend via `document.metadataReport`.

### b) Overrides éditoriaux
Les éditeurs peuvent modifier des champs. Ces modifications sont stockées dans :
`editorial_records.metadata`.

---

## 2) Fusion côté frontend

Dans `MetadataContext` :

```
baseMetadata (IA)  +  overrides (editorial)  => mergedMetadata
```

La règle est **override > IA**.

---

## 3) Auto-fix + validation

À l’affichage, un auto-fix est appliqué :
- ex: array → object
- “gratuit” → 0

Puis validation Zod par champ :

```
validateField(key, value)
```

Le UI affiche :
- **Erreur** si invalide
- **Erreur fixée** si auto-corrigé

---

## 4) Save

Les modifications sont sauvegardées via :
`saveMetadataFieldAction` → `editorial_records.metadata`

---

## 5) Preview / Publication

Le payload est construit à partir de `mergedMetadata` :

- `theme`, `secondaryThemes`, `needs` (root)
- `sponsors` (root)
- `metadatas` (sessions, fréquence, etc.)
- `translations.fr.content` (titre + markdown)

Le markdown est **normalisé** et le H1 est **retiré** (le titre est porté par `titreInformatif` / `titreMarque`).

---

## 6) Tables impliquées

- `letta_reports.metadata_ri` (IA)
- `editorial_records.metadata` (overrides)
- `publication_records.payload` (payload envoyé)

---

## Fichiers clés

- `apps/frontend/src/components/document-editor/metadata/MetadataContext.tsx`
- `packages/shared/src/lib/metadata-autofix.ts`
- `packages/shared/src/schemas/metadata-ri.ts`
- `packages/shared/src/lib/publication/refugies-info.ts`
