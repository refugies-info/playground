# Widget configs

Embeddable widgets are configured in the Playground but **stored by Refugies.info** (`widgetconfigs` collection). The Playground never writes to Mongo directly: it goes through the Refugies.info webhooks, like document publication (see [publish.md](publication/publish.md)).

```
UI (upcoming) → services/widget-config-actions.ts → services/ri/widget-configs.ts → services/ri/webhook-client.ts → RI webhooks
```

Payloads and defaults are documented in `documentation/client/webhooks.md` (Karfu'R repository, sections 7 and 8). Config reuses `RI_BASE_URL` and `RI_WEBHOOK_SECRET`.

## Things to know

- Every server action checks the Supabase session before using the RI secret, reads included.
- RI enforces permissions from the editor's email (Admin or Contrib role). The Playground does not filter by role.
- `structureName` is free text, unrelated to Refugies.info structures.
- There is no deletion: set `status` to `inactive`.
- The preview counter only accounts for filters, not for manually added or excluded documents.
- A `400` response exposes per-field errors in `fieldErrors` (`[{ key, message }]`).
