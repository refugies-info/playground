# Data Model – POC Sprint 0

> Scope is limited to scaffolding entities needed for Sprint 0 hand-off. Schema authoring (SQL + RLS) happens in Sprint 1, but types must be ready now.

## 1. User

- **Fields**:
  - `id: string` (Supabase auth UID)
  - `email: string`
  - `displayName: string`
  - `role: "editor" | "reviewer" | "admin"` (POC uses `editor` only)
  - `createdAt: string` (ISO)
- **Notes**: Mirrors Supabase Auth profile used by both frontend and Letta logs.

## 2. ContentItem

- **Fields**:
  - `id: string` (UUID)
  - `originalText: string`
  - `languageCode: "fr"` (locked for POC)
  - `sourceSystem: "manual_upload"`
  - `sourceRecordId: string`
  - `createdAt: string`
  - `createdBy: string` (User.id)
- **Relationships**: `ContentItem` 1→* `ContentFlag`.
- **Validation**: `originalText` required, `languageCode` must equal `fr`.

## 3. ContentFlag

- **Fields**:
  - `id: string`
  - `contentId: string` (ContentItem.id FK)
  - `flagStatus: "accepted" | "rejected"`
  - `aiReasoning: string`
  - `createdAt: string`
  - `createdBy: string | null` (null = AI, otherwise editor override)
  - `overrideReason: string | null`
- **Notes**: Supports AI result plus manual overrides per Principle 5.

## 4. MetadataMapping (placeholder)

- **Fields**:
  - `contentId: string`
  - `key: string`
  - `value: string`
  - `validatedBy: string`
  - `validatedAt: string`
- **Status**: Not implemented in Sprint 0 but types exist so frontend can shape future forms.

## 5. SupabaseEnv

- **Fields**:
  - `url: string`
  - `anonKey: string`
  - `serviceRoleKey: string`
- **Purpose**: Ensures quickstart + Next.js runtime share a typed contract for env parsing.

## Shared Type Export Map

```typescript
export type { User, ContentItem, ContentFlag, MetadataMapping } from './types';
export interface SupabaseEnv { url: string; anonKey: string; serviceRoleKey: string; }
```
