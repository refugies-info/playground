-- Enable read access for letta_reports
create policy "Enable read access for authenticated users"
on "public"."letta_reports"
for select
to authenticated
using (true);

-- Enable read access for ingestion_records (just in case)
create policy "Enable read access for authenticated users"
on "public"."ingestion_records"
for select
to authenticated
using (true);
