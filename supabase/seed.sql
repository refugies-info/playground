-- Seed data for local Supabase development
-- This file is run automatically by `supabase db reset`

-- Create admin users in auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'luis@refugies.info', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'jeremie@refugies.info', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'margot@refugies.info', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'nour@refugies.info', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'julie@refugies.info', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create editor users (test data)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'alice@refugies.info', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated', 'authenticated'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'claudia@refugies.info', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated', 'authenticated'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'xavier@refugies.info', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create identities for these users (required for Supabase Auth to work properly with email provider)
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT
  id,
  id,
  format('{"sub":"%s","email":"%s"}', id, email)::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
FROM auth.users
WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003'
)
ON CONFLICT (provider, id) DO NOTHING;
