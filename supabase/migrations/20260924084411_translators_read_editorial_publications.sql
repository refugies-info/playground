drop policy if exists "publication_records_select_policy" on public.publication_records;

create policy "publication_records_select_policy"
  on public.publication_records
  for select
  to authenticated
  using (
    (select public.get_my_role()) in ('admin', 'editor')
    OR
    (
      (select public.get_my_role()) = 'translator'
      AND (
        translation_record_id is null
        OR published_by = (select auth.uid())
        OR EXISTS (
          select 1 from public.translation_records tr
          where tr.id = translation_record_id
          and tr.language = (select public.get_my_language())
        )
      )
    )
  );
