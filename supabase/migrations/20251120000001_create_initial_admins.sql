-- Migration: Create initial admin users
-- Date: 2025-11-20
-- Purpose: Bootstrap first admin users for local development and staging
-- Security: Uses service role to create user records only
--          Passwords must be set via Supabase Auth API or admin panel
--          No plaintext passwords in version control

-- Create admin users
INSERT INTO public.users (id, email, role, created_at, updated_at, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'luis@refugies.info', 'admin', NOW(), NOW(), true),
  ('10000000-0000-0000-0000-000000000002', 'jeremie@refugies.info', 'admin', NOW(), NOW(), true),
  ('10000000-0000-0000-0000-000000000003', 'margot@refugies.info', 'admin', NOW(), NOW(), true),
  ('10000000-0000-0000-0000-000000000004', 'nour@refugies.info', 'admin', NOW(), NOW(), true),
  ('10000000-0000-0000-0000-000000000005', 'julie@refugies.info', 'admin', NOW(), NOW(), true)
ON CONFLICT (email) DO NOTHING;

-- Log user creation in audit trail
INSERT INTO public.audit_logs (id, user_id, action, status, details, created_at) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'email_signup', 'success', '{"ip_address": "127.0.0.1", "user_agent": "migration", "role": "admin", "source": "bootstrap"}'::jsonb, NOW()),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'email_signup', 'success', '{"ip_address": "127.0.0.1", "user_agent": "migration", "role": "admin", "source": "bootstrap"}'::jsonb, NOW()),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'email_signup', 'success', '{"ip_address": "127.0.0.1", "user_agent": "migration", "role": "admin", "source": "bootstrap"}'::jsonb, NOW()),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'email_signup', 'success', '{"ip_address": "127.0.0.1", "user_agent": "migration", "role": "admin", "source": "bootstrap"}'::jsonb, NOW()),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'email_signup', 'success', '{"ip_address": "127.0.0.1", "user_agent": "migration", "role": "admin", "source": "bootstrap"}'::jsonb, NOW())
ON CONFLICT DO NOTHING;
