-- Enable update access for workflows (for status changes, etc.)
create policy "Enable update access for authenticated users"
on "public"."workflows"
for update
to authenticated
using (true)
with check (true);
