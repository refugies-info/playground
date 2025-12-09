
  create policy "Authenticated users can read"
  on "public"."editorial_records"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Authenticated users can read"
  on "public"."rco_records"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Authenticated users can read"
  on "public"."workflows"
  as permissive
  for select
  to authenticated
using (true);



