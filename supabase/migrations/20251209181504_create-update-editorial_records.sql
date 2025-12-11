
  create policy "Enable insert for authenticated users only"
  on "public"."editorial_records"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable update for authenticated users only"
  on "public"."editorial_records"
  as permissive
  for update
  to public
using (true);



