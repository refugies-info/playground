# Translation Publication Workflow

## Overview

The translation publication workflow handles publishing translated content to Réfugiés.info via webhooks, with real-time feedback to the frontend.

## Architecture

### Data Flow

```
User clicks "Publier"
    ↓
TranslationContext.saveTranslation() (auto-save)
    ↓
TranslationContext.publishTranslation()
    ↓
Server Action: start(translationPublicationWorkflow)
    ↓
Workflow: publishTranslationStep
    ↓
Webhook POST to Réfugiés.info
    ↓
Create publication_record (status: published/failed)
    ↓
Realtime INSERT event
    ↓
Frontend: Display URL or error
```

### Realtime Integration

The frontend subscribes to `publication_records` INSERT events:

```typescript
supabase
  .channel(`translation-${translationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    table: 'publication_records',
    filter: `translation_record_id=eq.${translationId}`
  }, (payload) => {
    // Handle success or failure
  })
```

## Error Handling

### Workflow Errors

When the workflow fails, it creates a `publication_record` with:
- `status = 'failed'`
- `error_message` = Detailed error message
- `mode = 'translation'`

The frontend displays this error in real-time via Realtime subscription.

### Common Error Cases

1. **Missing content**: "La traduction n'a pas de contenu"
2. **Source not published**: "La fiche source doit être publiée avant de pouvoir publier une traduction"
3. **Webhook failure**: "Webhook error {status}" or specific error message
4. **Configuration missing**: "Missing webhook secret configuration"

## Database Schema

### publication_records

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `workflow_id` | uuid | FK to workflows |
| `translation_record_id` | uuid | FK to translation_records |
| `target` | text | Base URL (e.g., "http://localhost:3000") |
| `remote_id` | text | MongoDB ObjectId from Réfugiés.info |
| `status` | text | 'published', 'failed', or 'archived' |
| `mode` | text | 'publish', 'translation', or 'archive' |
| `error_message` | text | Error details if status='failed' |
| `payload` | jsonb | Webhook payload sent |
| `published_by` | uuid | User who published |

### Status Values

- `published`: Successfully published to Réfugiés.info
- `failed`: Workflow error (webhook failure, validation error, etc.)
- `archived`: Content archived

### Mode Values

- `publish`: Original document publication
- `translation`: Translation publication
- `archive`: Archival action

## Frontend UX

### Publication Overlay States

1. **Publishing**: Spinner + "En cours de publication..."
2. **Success**: URL display + copy/open buttons
3. **Error**: Error message + retry button

### Retry Mechanism

Users can retry failed publications. The workflow:
1. Clears previous error
2. Re-saves the translation
3. Re-triggers the publication workflow

## Migrations

### 20260217063000_add_error_message_to_publication_records.sql

Adds `error_message` column and status CHECK constraint.

### 20260217071000_enable_realtime_publication_records.sql

Enables Realtime on `publication_records` table for INSERT events.

## Related Documentation

- [Webhook Integration](../api/webhooks.md) - Webhook payloads and endpoints
- [Realtime Setup](../database/realtime.md) - Supabase Realtime configuration
- [Translation Editor](../frontend/translation-editor.md) - Frontend components
