# Configuration des widgets

Les widgets embarquables sont configurés dans le Playground mais **stockés par Refugies.info** (collection `widgetconfigs`). Le Playground n'écrit jamais directement dans Mongo : il passe par les webhooks de Refugies.info, comme pour la publication des fiches (voir [publish.md](publication/publish.md)).

## Architecture

```
UI (à venir) → widget-config-actions.ts → ri/widget-configs.ts → ri/webhook-client.ts → webhooks RI
```

| Fichier | Rôle |
|---|---|
| `services/ri/webhook-client.ts` | Appel générique d'un webhook RI (secret partagé, timeout, erreurs typées). Utilisé aussi par `ri/reference-data.ts`. |
| `services/ri/widget-configs.ts` | Une fonction par endpoint. Sans authentification : l'email de l'éditeur est passé en paramètre. |
| `services/widget-config-actions.ts` | Server actions. Chaque action vérifie la session Supabase avant d'utiliser le secret RI, lectures comprises. |
| `packages/shared/src/types/widget-config.ts` | Types et constantes miroirs du contrat des webhooks. |

La configuration réutilise `RI_BASE_URL` et `RI_WEBHOOK_SECRET`.

## Endpoints utilisés

Le détail des payloads et des valeurs par défaut est dans `documentation/client/webhooks.md` (dépôt Karfu'R, sections 7 et 8).

| Action | Endpoint RI |
|---|---|
| `searchDispositifsAction`, `getDispositifsByIdsAction` | `GET /api/webhook/dispositif/search` |
| `countFilterMatchesAction` | `POST /api/webhook/widget-config/preview-count` |
| `listWidgetConfigsAction`, `getWidgetConfigAction` | `GET /api/webhook/widget-config[/{id}]` |
| `createWidgetConfigAction` | `POST /api/webhook/widget-config/create` |
| `updateWidgetConfigAction` | `PATCH /api/webhook/widget-config/update` |

## Points d'attention

- Les droits sont contrôlés par RI à partir de l'email de l'éditeur (rôle Admin ou Contrib). Les actions ne filtrent pas par rôle Playground.
- La structure d'un widget (`structureName`) est un texte libre, sans lien avec les structures de Refugies.info : il n'y a pas de liste à charger.
- Il n'y a pas de suppression : on passe `status` à `inactive`.
- Le compteur de l'aperçu ne tient compte que des filtres, pas des fiches ajoutées ou exclues manuellement.
- Une réponse `400` expose les erreurs par champ dans `fieldErrors` (`[{ key, message }]`).
