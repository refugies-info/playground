-- Seed data for local Supabase development
-- This file is run automatically by `supabase db reset`
-- NOTE: Initial admin users are created via migration (20251120_001_create_initial_admins.sql)
--       No plaintext passwords are stored in version control for security

-- Editor users (test data)
INSERT INTO public.users (id, email, role, created_at, updated_at, is_active) VALUES
  ('20000000-0000-0000-0000-000000000001', 'alice@refugies.info', 'editor', NOW(), NOW(), true),
  ('20000000-0000-0000-0000-000000000002', 'claudia@refugies.info', 'editor', NOW(), NOW(), true),
  ('20000000-0000-0000-0000-000000000003', 'xavier@refugies.info', 'editor', NOW(), NOW(), true)
ON CONFLICT (email) DO NOTHING;

-- Audit log entries for editor user creation
INSERT INTO public.audit_logs (id, user_id, action, status, details, created_at) VALUES
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'email_signup', 'success', '{"ip_address": "127.0.0.1", "user_agent": "seed", "role": "editor", "source": "seed"}'::jsonb, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.audit_logs (id, user_id, action, status, details, created_at) VALUES
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', 'email_signup', 'success', '{"ip_address": "127.0.0.1", "user_agent": "seed", "role": "editor", "source": "seed"}'::jsonb, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.audit_logs (id, user_id, action, status, details, created_at) VALUES
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'email_signup', 'success', '{"ip_address": "127.0.0.1", "user_agent": "seed", "role": "editor", "source": "seed"}'::jsonb, NOW())
ON CONFLICT DO NOTHING;
