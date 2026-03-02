# Publication vers Refugies.info

Cette fonctionnalité permet de publier le contenu édité dans le Content Playground directement vers l'application Refugies.info (ou une autre destination compatible) via un webhook.

## Architecture

Le processus de publication suit les étapes suivantes :

1.  **Validation** : Le document doit être au statut `compliant` (validé par l'IA ou l'humain).
2.  **Authentification** : L'email de l'utilisateur connecté est récupéré côté serveur (sécurisé).
3.  **Submission** : Une Server Action `publishDocument` est appelée.
4.  **Webhook** : Le Playground appelle le webhook de l'application cible avec un payload JSON (create/update).
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
- **Publication (create)** : `${RI_BASE_URL}/api/webhook/dispositif/create`
- **Publication (update)** : `${RI_BASE_URL}/api/webhook/dispositif/update`

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
    "origin": "RCO",
    "theme": "63286a015d31b2c0cad99615",
    "secondaryThemes": ["63286a025d31b2c0cad99616"],
    "needs": [],
    "sponsors": [
      { "name": "Alliance Française" }
    ],
    "metadatas": {
      "sessions": [
        {
          "startDate": "2025-11-24T00:00:00Z",
          "endDate": "2026-01-16T00:00:00Z",
          "registrationStartDate": "2025-10-01T00:00:00Z",
          "registrationEndDate": "2025-11-20T23:59:59Z",
          "externalRef": "585188",
          "url": "https://example.com"
        }
      ]
    },
    "translations": {
      "fr": {
        "content": {
          "titreInformatif": "Titre du document",
          "titreMarque": "Titre du document",
          "abstract": "Résumé",
          "markdown": "Contenu markdown..."
        }
      }
    }
  }
}
```

### Notes importantes
- **Create vs update** : si un `remote_id` existe, le payload inclut `_id` et n’inclut pas `origin`.
- **Métadonnées** : le payload utilise **merged metadata** (IA + overrides).
- **Sessions** : les champs `periode` sont convertis en `metadatas.sessions` avec des dates ISO.
- **H1** : le H1 est retiré du markdown envoyé (le titre est porté par `titreInformatif`/`titreMarque`).
