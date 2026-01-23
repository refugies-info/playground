# Documentation de la fonctionnalité Prévisualisation

## Vue d'ensemble
La fonctionnalité de prévisualisation permet aux utilisateurs d'ouvrir un nouvel onglet affichant le rendu du contenu en cours d'édition directement sur l'application principale (Main App).

Cette fonctionnalité est déclenchée par le bouton "Prévisualiser" (icône œil) dans la barre d'outils de l'éditeur (`TopBar`).

## Configuration
Le Playground a besoin de deux variables d'environnement pour fonctionner :

Fichier : `apps/frontend/.env`

```bash
# URL de l'endpoint de prévisualisation de la Main App
NEXT_PUBLIC_PREVIEW_URL=http://localhost:3000/dispositif/preview

# Secret partagé avec la Main App pour authentifier la requête
RI_WEBHOOK_SECRET=votre_secret_partagé
```

## Implémentation technique

L'architecture repose sur une soumission de formulaire POST directe ("Form Post") sécurisée par une Server Action.

### Fichiers clés
*   `apps/frontend/src/lib/preview-utils.ts` : Contient la logique métier (création du payload, appel server action, soumission du formulaire).
*   `apps/frontend/src/services/document-actions.ts` : Contient la Server Action `getPreviewSecret` pour récupérer le secret sécurisé.

### Flux d'exécution

1.  **Clic Utilisateur** : L'utilisateur clique sur "Prévisualiser".
2.  **Récupération du Secret** : Le client appelle la Server Action `getPreviewSecret()`.
    *   Le serveur lit `RI_WEBHOOK_SECRET` (non accessible au client directement).
    *   Le serveur renvoie le secret au client.
3.  **Construction du Formulaire** : Le client crée dynamiquement un formulaire `<form>` invisible :
    *   `target="_blank"` : Ouvre un nouvel onglet.
    *   `method="POST"` : Envoie les données dans le corps.
    *   `action` : `NEXT_PUBLIC_PREVIEW_URL`.
4.  **Champs du formulaire** :
    *   `json` : Un objet JSON complet contenant la structure du dispositif (titre, markdown, métadonnées, etc.) au format attendu par la Main App.
    *   `webhook-secret` : Le secret récupéré à l'étape 2.
5.  **Soumission** : Le formulaire est soumis (`form.submit()`) et l'utilisateur est redirigé vers la Main App.

### Pourquoi cette architecture ?
*   **Contournement CORS** : En utilisant un formulaire POST standard, la navigation est considérée comme "top-level", évitant les restrictions de sécurité Cross-Origin (CORS) qui bloqueraient une requête AJAX ou une iframe.
*   **Sécurité** : Le `RI_WEBHOOK_SECRET` n'est jamais inclus dans le bundle JavaScript du client. Il est récupéré à la demande uniquement pour la soumission.

## Format des données (Payload)

Le champ `json` contient un objet structuré ainsi :

```json
{
  "dispositif": {
    "typeContenu": "dispositif",
    "theme": "...",
    "status": "Actif",
    "titreInformatif": "Titre du document",
    "origin": "RCO",
    "translations": {
      "fr": {
        "content": {
          "titreInformatif": "Titre du document",
          "titreMarque": "Titre du document",
          "abstract": "",
          "markdown": "Contenu éditorial..."
        }
      }
    }
  }
}
```
