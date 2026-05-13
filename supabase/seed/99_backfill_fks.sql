-- Backfill circular FK references
-- Ces colonnes sont laissées NULL lors de l''insert initial pour éviter les violations FK.

-- Backfill profiles.role et profiles.language depuis auth.users metadata
UPDATE public.profiles p
SET
  role     = coalesce(p.role,     u.raw_user_meta_data->>'role'),
  language = coalesce(p.language, nullif(u.raw_user_meta_data->>'language', ''))
FROM auth.users u
WHERE p.id = u.id
  AND (p.role IS NULL OR p.language IS NULL);

-- Backfill workflows.editorial_record_id
UPDATE workflows SET editorial_record_id = 'ee000001-0000-0000-0000-000000000000' WHERE id = 'cc000003-0000-0000-0000-000000000000';
UPDATE workflows SET editorial_record_id = 'ee000002-0000-0000-0000-000000000000' WHERE id = 'cc000004-0000-0000-0000-000000000000';
UPDATE workflows SET editorial_record_id = 'ee000003-0000-0000-0000-000000000000' WHERE id = 'cc000006-0000-0000-0000-000000000000';
