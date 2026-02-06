-- Add RLS policies for rco_records table
-- This table had RLS enabled but no policies defined, making it inaccessible

-- Allow authenticated users with admin/editor roles to view rco_records
create policy "rco_records_select_policy" 
  on public.rco_records 
  for select 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  );

-- Allow admin/editor to insert rco_records
create policy "rco_records_insert_policy" 
  on public.rco_records 
  for insert 
  to authenticated 
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
  );

-- Allow admin/editor to update rco_records
create policy "rco_records_update_policy" 
  on public.rco_records 
  for update 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  )
  with check (
    (select public.get_my_role()) in ('admin', 'editor')
  );

-- Allow admin/editor to delete rco_records
create policy "rco_records_delete_policy" 
  on public.rco_records 
  for delete 
  to authenticated 
  using (
    (select public.get_my_role()) in ('admin', 'editor')
  );
