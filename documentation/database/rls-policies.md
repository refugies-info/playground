# Row-Level Security (RLS)

How access control works in the database. The policies themselves live in `supabase/migrations/` (grep `create policy`); this page explains the model so you can extend it consistently.

## Role model

- Roles: `admin`, `editor`, `translator`. A user with no profile role gets `none` and sees nothing.
- **`public.profiles` is the source of truth** for `role` and `language` (a translator's assigned language). They are written only server-side with the service role (`apps/frontend/src/app/actions/users.ts`); `authenticated` can only update the display columns (`first_name`, `last_name`, `full_name`, `avatar_url`), so nobody can escalate their own role.
- Policies call two helpers, `public.get_my_role()` and `public.get_my_language()`. They read `profiles` for `auth.uid()` (from the verified JWT, unforgeable) and are `security definer` to avoid infinite recursion through RLS on `profiles`. JWT `user_metadata` claims and the Custom Access Token Hook are **not** used (see `20260421102209_rbac_custom_access_token_hook.sql`).
- Always wrap the helpers in a subselect, `(select public.get_my_role())`, so Postgres evaluates them once per query instead of once per row.

## Access matrix (authenticated users)

| Table | Admin / Editor | Translator |
| :--- | :--- | :--- |
| `editorial_records`, `ingestion_records`, `workflows` | full | select |
| `translation_records` | full | select / update where `language = get_my_language()` |
| `publication_records` | full | select: editorial publications (`translation_record_id is null`), own, or in their language; insert; update own (`published_by`) |
| `letta_reports`, `rco_records` | full | denied |
| `di_structures`, `di_services`, `activity_logs` | select | select |
| `profiles` | select all; update own display fields | same |
| `notifications` | select / update own (`recipient_id = auth.uid()`), only `read_at` and `archived_at` | same |

`activity_logs` and `notifications` are written by the server only (service role).

## Rules when adding a table or policy

- RLS on + policies are not enough: the role also needs a table `GRANT`. Migrations have repeatedly failed in production on missing grants (`42501 permission denied`), for `authenticated` and for `service_role` alike, because `supabase db push` does not apply the defaults that a local `db reset` does. Grant explicitly in the same migration.
- `anon` has no privileges on `public` (`20260206130000_revoke_anon_privileges.sql`). Keep it that way.
- Views read by the app (`workflows_enriched`, `di_*_latest`) use `security_invoker = on`, so they inherit the RLS of their underlying tables: any table a view joins needs a matching select policy.
- The service role bypasses RLS; use it only where RLS cannot apply (workflows, user admin), see `AGENTS.md`.
- To replace a policy, `drop policy if exists` then `create policy` in a new migration (e.g. `20260924084411_translators_read_editorial_publications.sql`).

See also the [Migrations guide](./migrations.md).
