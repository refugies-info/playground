# Archivage

Cette fonctionnalité permet de retirer un contenu publié de l'application Refugies.info en le passant au statut "Archivé".

## Processus Technique

L'archivage utilise le même canal (webhook) que la publication, mais avec un statut spécifique.

### Conditions préalables

*   Le document **doit avoir été publié** au moins une fois (présence d'un `remote_id` dans `publication_records`).
*   L'utilisateur doit être authentifié.

### Flux d'exécution

Le processus est géré par la Server Action `archiveDocument` (`apps/frontend/src/services/document-actions.ts`) :

1.  **Vérification** : Récupération du dernier enregistrement de publication pour ce workflow. Si aucun `remote_id` n'est trouvé, l'archivage est impossible.
2.  **Construction du Payload** :
    *   Structure identique à une publication standard.
    *   **Statut forcé** : `status: "Archivé"`.
    *   **ID Ciblé** : `dispositif._id` est renseigné avec le `remote_id` pour cibler le document existant.
3.  **Appel Webhook** : Envoi POST vers l'API cible (`/api/webhook/dispositif`) avec le secret.
4.  **Mise à jour Locale** :
    *   Table `publication_records` : statut passe à `archived`.
    *   Table `workflows` : progress passe à `archived`.

## Payload d'Archivage

```json
{
  "email": "user@example.com",
  "dispositif": {
    "_id": "5f8d...", // ID distant (MongoDB)
    "typeContenu": "dispositif",
    "theme": "...",
    "status": "Archivé", // <--- Point clé
    "origin": "RCO",
    "translations": { ... }
  }
}
```

## Conséquences

*   Sur **Refugies.info** : Le dispositif n'est plus visible dans les recherches et listings publics.
*   Sur le **Playground** : Le workflow est marqué comme archivé (badge gris). Il reste consultable mais est considéré comme "inactif".
