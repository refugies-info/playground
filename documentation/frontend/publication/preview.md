# Documentation de la fonctionnalité Prévisualisation

## Vue d'ensemble
La fonctionnalité de prévisualisation permet aux utilisateurs d'ouvrir un nouvel onglet affichant le rendu du contenu Markdown en cours d'édition.
Cette fonctionnalité est déclenchée par le bouton "Prévisualiser" (icône œil) dans la barre d'outils de l'éditeur (`TopBar`).

## Configuration
Cette fonctionnalité dépend d'une variable d'environnement pour connaître l'URL de destination.

Fichier : `apps/frontend/.env`

```bash
NEXT_PUBLIC_PREVIEW_URL=https://votre-url-de-preview.com/path
```

### Exemple local
Pour un développement local, vous pouvez pointer vers votre application principale ou un service de rendu :
```bash
NEXT_PUBLIC_PREVIEW_URL=http://localhost:3001/dispositif/63a09096e05318191f096910
```

## Implémentation technique

L'implémentation est entièrement côté client ("Client Component") pour permettre l'ouverture d'un nouvel onglet, ce qui n'est pas possible directement depuis une Server Action.

**Fichier clé** : `apps/frontend/src/components/document-editor/DocumentContext.tsx`

La fonction `previewDocument` effectue les étapes suivantes :
1.  Vérifie la présence de `NEXT_PUBLIC_PREVIEW_URL`.
2.  Crée dynamiquement un élément HTML `<form>` invisible.
3.  Configure le formulaire :
    *   `target="_blank"` : Pour ouvrir dans un nouvel onglet.
    *   `method="POST"` : Pour envoyer les données dans le corps de la requête.
    *   `action` : L'URL définie dans la variable d'environnement.
4.  Ajoute un champ caché (`input type="hidden"`) nommé `markdown` contenant le contenu éditorial actuel.
5.  Soumet le formulaire (`form.submit()`) puis le supprime du DOM.

Cette approche "fire-and-forget" permet de passer une grande quantité de données (contenu markdown) sans les limites d'une URL (GET parameters), tout en déclenchant la navigation native du navigateur.

## To Do / Évolutions futures

Actuellement, seul le contenu brut (Markdown) est envoyé dans le champ `markdown`.
Pour respecter le format de données attendu par Réfugiés.info et permettre une prévisualisation fidèle, il faudra évoluer vers l'envoi d'un objet JSON complet comprenant :
*   Le contenu éditorial (Markdown).
*   Les métadonnées du dispositif (titre, résumé, thèmes, etc.).
*   La structure complète conforme au schéma de données de Réfugiés.info.
