-- Allow authenticated users to update publication records (for archiving or re-publishing)
create policy "Authenticated users can update publication_records"
  on public.publication_records for update to authenticated using (true);
