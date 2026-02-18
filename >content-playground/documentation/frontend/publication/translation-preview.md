# Prévisualisation des Traductions

## Vue d'ensemble

La fonctionnalité de prévisualisation des traductions permet aux traducteur·ices de voir le rendu final d'une traduction avant sa publication, directement sur l'application Réfugiés.info (Karfur).

## Contrat d'API

### Endpoint

```
POST /{locale}/dispositif/preview
```

Exemples :
- `/ar/dispositif/preview` (pour l'arabe)
- `/en/dispositif/preview` (pour l'anglais)
- `/ps/dispositif/preview` (pour le pachto)

### Format du Payload

```json
{
  "dispositif": {
    "titreInformatif": "Titre en français (fallback)",
    "titreMarque": "Marque française",
    "abstract": "Résumé français",
    "origin": "RCO",
    "theme": "63286a015d31b2c0cad99615",
    "secondaryThemes": [],
    "needs": [],
    "metadatas": {
      "location": "à distance",
      "frenchLevel": ["A1", "A2"],
      "sessions": [...]
    },
    "translations": {
      "fr": {
        "content": {
          "titreInformatif": "Titre en français",
          "titreMarque": "Marque française",
          "abstract": "Résumé français",
          "markdown": "# Contenu FR..."
        }
      },
      "ar": {
        "content": {
          "titreInformatif": "العنوان بالعربية",
          "titreMarque": "العلامة التجارية",
          "abstract": "الملخص",
          "markdown": "# Contenu arabe..."
        }
      }
    }
  }
}
```

### Authentification

Le secret webhook est envoyé dans le form-data :
- Champ `webhook-secret` : Secret partagé avec Karfur
- Champ `json` : Payload JSON stringifié

## Architecture Technique

### Flux d'exécution

```
Utilisateur clique "Prévisualiser"
    ↓
TranslationContext.previewTranslation()
    ↓
Auto-save de la traduction
    ↓
buildTranslationPreviewPayload()
    ↓
submitTranslationPreview()
    ↓
POST /{locale}/dispositif/preview
    ↓
Karfur affiche la preview
```

### Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `apps/frontend/src/lib/payload-builder.ts` | Construction du payload avec FR fallback + traduction |
| `apps/frontend/src/lib/preview-utils.ts` | Soumission du formulaire POST vers Karfur |
| `apps/frontend/src/components/translation-editor/TranslationContext.tsx` | Logique métier (auto-save, appel preview) |
| `apps/frontend/src/components/translation-editor/TranslationActions.tsx` | UI (bouton avec état disabled) |
| `apps/frontend/src/services/translations.ts` | Récupération des métadonnées source |

### Prérequis

La prévisualisation n'est disponible que si :
- La fiche source (FR) est publiée (`publicationUrl` existe)
- Sinon, le bouton est désactivé avec tooltip explicatif

## Implémentation

### Payload Builder

```typescript
// Construction du payload avec fallback FR
const payload = await buildTranslationPreviewPayload({
  language: "ar",           // Langue cible
  title: "العنوان",         // Titre traduit
  markdown: "# ...",        // Contenu traduit
  sourceMarkdown: "# ...",  // Contenu FR original
  sourceMetadata: {...},    // Métadonnées de la fiche FR
});
```

Le payload inclut toujours :
1. **Métadonnées FR** (fallback) : `titreInformatif`, `theme`, `metadatas`, etc.
2. **Traduction FR** : Dans `translations.fr` pour référence
3. **Traduction cible** : Dans `translations[language]` (ex: `translations.ar`)

### UI

Le bouton "Prévisualiser" dans l'éditeur de traduction :
- **Actif** : Si la fiche FR source est publiée
- **Désactivé** : Sinon, avec tooltip "La fiche source doit être publiée avant de pouvoir prévisualiser"

## Différences avec Preview FR

| Aspect | Preview FR | Preview Traduction |
|--------|-----------|-------------------|
| **URL** | `/dispositif/preview` | `/{locale}/dispositif/preview` |
| **Payload** | `translations.fr` uniquement | `translations.fr` + `translations[locale]` |
| **Fallback** | Non applicable | Métadonnées FR toujours présentes |
| **Prérequis** | Aucun | Fiche FR publiée obligatoire |

## Coordination avec Karfur

Cette fonctionnalité nécessite des modifications côté Réfugiés.info (Karfur) :

1. **Nouvelles routes** : `/{locale}/dispositif/preview` pour chaque langue supportée
2. **Gestion du payload** : Lire `translations[locale]` au lieu de hardcoder `translations.fr`
3. **Fallback** : Utiliser les métadonnées FR si les champs traduits sont vides

## Voir aussi

- [Prévisualisation FR](./preview.md) - Preview des documents originaux
- [Publication des traductions](./publish.md) - Publication finale des traductions
- [Workflows de traduction](../../workflows/translation-publication.md) - Orchestration complète
