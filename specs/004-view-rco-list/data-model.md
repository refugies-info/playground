# Data Model: View Document List

## Entities

### MockDocument

Represents a document in the mock database.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Unique identifier |
| `title` | `string` | Document title |
| `date_added` | `string` (ISO 8601) | Date when added to system |
| `status` | `enum` | 'accepted', 'rejected' |
| `state` | `enum` | 'draft', 'to_process', 'archived', 'published' |
| `source` | `string` | Source system (e.g. 'RCO') |
| `content` | `string` | Text or Markdown content |
| `metadata` | `jsonb` | Arbitrary metadata |

## Types (TypeScript)

```typescript
export type DocumentStatus = 'accepted' | 'rejected';
export type DocumentState = 'draft' | 'to_process' | 'archived' | 'published';

export interface MockDocument {
  id: string;
  title: string;
  date_added: string;
  status: DocumentStatus;
  state: DocumentState;
  source: string;
  content: string;
  metadata: Record<string, any>;
}
```
