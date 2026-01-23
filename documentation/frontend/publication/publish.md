# Publication vers Refugies.info

Cette fonctionnalité permet de publier le contenu édité dans le Content Playground directement vers l'application Refugies.info (ou une autre destination compatible) via un webhook.

## Architecture

Le processus de publication suit les étapes suivantes :

1.  **Validation** : Le document doit être au statut `compliant` (validé par l'IA ou l'humain).
2.  **Authentification** : L'email de l'utilisateur connecté est récupéré côté serveur (sécurisé).
3.  **Submission** : Une Server Action `publishDocument` est appelée.
4.  **Webhook** : Le Playground appelle le webhook de l'application cible avec un payload JSON.
5.  **Enregistrement** : 
    - L'ID distant retourné par le webhook est stocké dans la table `publication_records`.
    - Le workflow passe au statut `published`.

6.  **Mise à jour** : Si le document a déjà été publié (présence d'un `remote_id`), le payload inclut cet ID (`_id`) pour mettre à jour le document existant au lieu d'en créer un nouveau.


## Configuration

Deux variables d'environnement sont nécessaires dans `apps/frontend/.env` :

```bash
# Base URL de l'application cible (Staging ou Production)
# Ex: http://localhost:3000 ou https://staging.refugies.info
RI_BASE_URL=https://staging.refugies.info

# Secret partagé pour signer/vérifier les requêtes
RI_WEBHOOK_SECRET=votre_secret_partage
```

Les routes sont construites automatiquement :
- **Preview** : `${RI_BASE_URL}/dispositif/preview`
- **Publication** : `${RI_BASE_URL}/api/webhook/dispositif`

## Base de données

### Table `publication_records`

Stocke l'historique des publications :

- `workflow_id` : Lien vers le document source.
- `target` : L'URL cible (pour supporter plusieurs environnements).
- `remote_id` : L'ID du dispositif créé sur l'application distante (MongoDB ID).
- `status` : Statut de la publication (`published`).
- `payload` : Copie du JSON envoyé (pour debug/audit).
- `published_by` : ID de l'utilisateur ayant publié.

### Sécurité (RLS) policies

- **Lecture** : Uniquement les utilisateurs authentifiés.
- **Écriture** : Uniquement les utilisateurs authentifiés.
- **Accès anonyme** : Interdit.

## Format du Payload

Le webhook reçoit un POST request avec :

- **Headers** : 
  - `Content-Type: application/json`
  - `webhook-secret: <RI_WEBHOOK_SECRET>`
- **Body** :

```json
{
  "email": "user@example.com",
  "dispositif": {
    "typeContenu": "dispositif",
    "theme": "...",
    "titreInformatif": "Titre du document",
    "origin": "RCO",
    "translations": {
      "fr": {
        "content": {
          "markdown": "Contenu markdown..."
        }
      }
    }
  }
}
```
