# Widget configs

Embeddable widgets are configured in the Playground but **stored by Refugies.info** (`widget_config` collection). The Playground never writes to Mongo directly: it goes through the Refugies.info webhooks, like document publication (see [publish.md](publication/publish.md)).

```
UI (upcoming) → services/widget-config-actions.ts → services/ri/widget-configs.ts → services/ri/webhook-client.ts → RI webhooks
```

Payloads and defaults are documented in `documentation/client/webhooks.md` (Karfu'R repository, sections 7 and 8). Config reuses `RI_BASE_URL` and `RI_WEBHOOK_SECRET`.

## Widget types

The fields of a config depend on its `type`, which cannot be changed once the widget is created (`WidgetConfigFields` is a union in `@playground/shared-types`):

- `list`: title, description, filters, manually added or excluded contents, page size, sort and display options.
- `thumbnail`: a single content, chosen by `dispositifId`, with the common fields only (`internalTitle`, `structureName`, `authorizedDomains`, `externalTitle`, `status`).

RI rejects a field that does not belong to the type of the widget.

## Things to know

- Every server action checks the Supabase session before using the RI secret, reads included.
- RI enforces permissions from the editor's email (Admin or Contrib role). The Playground does not filter by role.
- `structureName` is free text, unrelated to Refugies.info structures.
- There is no deletion: set `status` to `inactive`.
- The preview counter only accounts for filters, not for manually added or excluded documents.
- A `400` response exposes per-field errors in `fieldErrors` (`[{ key, message }]`).
