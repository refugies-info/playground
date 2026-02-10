-- Migration to fix foreign key relationships for PostgREST embedding
-- We need to point author_id / published_by to public.profiles instead of auth.users
-- so that we can query editorial_records?select=*,profiles(*)

-- 1. editorial_records
ALTER TABLE public.editorial_records DROP CONSTRAINT IF EXISTS editorial_records_author_id_fkey;
ALTER TABLE public.editorial_records
  ADD CONSTRAINT editorial_records_author_id_fkey
  FOREIGN KEY (author_id)
  REFERENCES public.profiles(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- 2. translation_records
ALTER TABLE public.translation_records DROP CONSTRAINT IF EXISTS translation_records_author_id_fkey;
ALTER TABLE public.translation_records
  ADD CONSTRAINT translation_records_author_id_fkey
  FOREIGN KEY (author_id)
  REFERENCES public.profiles(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- 3. publication_records (author_id)
ALTER TABLE public.publication_records DROP CONSTRAINT IF EXISTS publication_records_author_id_fkey;
ALTER TABLE public.publication_records
  ADD CONSTRAINT publication_records_author_id_fkey
  FOREIGN KEY (author_id)
  REFERENCES public.profiles(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- 4. publication_records (published_by)
-- Need to check if a constraint exists. It was created in 20260114100050.
-- Likely publication_records_published_by_fkey
ALTER TABLE public.publication_records DROP CONSTRAINT IF EXISTS publication_records_published_by_fkey;
ALTER TABLE public.publication_records
  ADD CONSTRAINT publication_records_published_by_fkey
  FOREIGN KEY (published_by)
  REFERENCES public.profiles(id)
  ON UPDATE CASCADE ON DELETE SET NULL;
