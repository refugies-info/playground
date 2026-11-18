-- RLS is enabled on ingestion_runs without any policy: the /workflow page
-- needs to read the latest run (status, RCO checkpoint) with the user client.
CREATE POLICY "ingestion_runs_select_policy"
ON public.ingestion_runs
FOR SELECT
TO authenticated
USING (
  (select public.get_my_role()) in ('admin', 'editor', 'translator')
);
