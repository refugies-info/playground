
  create policy "Authenticated users can read"
  on "public"."ingestion_records"
  as permissive
  for select
  to authenticated
using (true);



