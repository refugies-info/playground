# Document Editor — Contexts & Route Architecture

Ce document décrit l’architecture des **contexts** et la structure des composants pour la route `/documents/*`.

## Vue d’ensemble des routes

```
/documents/[id]/page.tsx         → EditionView (onglet “Fiche”)
/documents/[id]/metadata/page.tsx → MetadataView (onglet “Métadonnées”)
/documents/[id]/compliance/page.tsx → ArbitrationView (onglet “Arbitrage”)
/documents/[id]/layout.tsx       → DocumentLayout (providers + layout UI)
```

## Composition des providers (layout)

`DocumentLayout` installe les providers partagés par tous les onglets :

```
DocumentProvider
  └── MetadataProvider
        └── DocumentActionsProvider
              └── Layout UI (TopBar / Navigation / Assistant)
```

### Rôles principaux

- **DocumentProvider**
  - Source de vérité du document (`editorialContent`, statut, metadata, etc.)
  - Gère `updateContent`, état de sauvegarde, `canPublish`, etc.

- **MetadataProvider**
  - Fournit les métadonnées mergées (IA + overrides)
  - Gère la validation Zod, auto-fix, et statuts par champ

- **DocumentActionsProvider**
  - Centralise les actions (preview / save / publish / archive)
  - Utilise **document** + **merged metadata**

## Structure des composants (document-editor)

```
document-editor/
  actions/
    DocumentActionsContext.tsx
    hooks/usePublicationPolling.ts
    ui/DocumentActions.tsx
    ui/PublishConfirmationDialog.tsx
    ui/PublishSuccessDialog.tsx
    index.ts
  editor/
    EditionView.tsx
    RawMarkdownView.tsx
    EditorTabs.tsx
    OriginalContentView.tsx
    AiSuggestionBanner.tsx
    slash-menu-config.tsx
    blocks/
    index.ts
  metadata/ (structure dédiée)
  assistant/
  arbitration/
  shared/
  DocumentContext.tsx
```

## Flux éditorial (résumé)

1. L’utilisateur édite le contenu (BlockNote ou raw markdown)
2. `DocumentContext` met à jour `editorialContent` (local)
3. **Save** → workflow `saveDocumentStep` (markdown → extraction du H1 → metadata.title)
4. **Publish** → payload construit avec merged metadata + markdown normalisé

## Où modifier ?

- **UI actions** : `document-editor/actions/ui/DocumentActions.tsx`
- **Actions métier** : `document-editor/actions/DocumentActionsContext.tsx`
- **Éditeur** : `document-editor/editor/EditionView.tsx`
- **Metadata** : `document-editor/metadata/*`

## Liens utiles

- [`documentation/architecture/h1-title-flow.md`](./h1-title-flow.md)
- [`documentation/frontend/publication/publish.md`](../frontend/publication/publish.md)