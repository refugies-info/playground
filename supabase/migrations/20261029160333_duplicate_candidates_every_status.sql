-- Duplicate shortlist for the RCO arbitration: every playground document that
-- already has a status (to process, draft, published, archived...), so a
-- record archived or refused before is not published again. Documents still
-- waiting for their arbitration have no status yet and stay out.
DROP FUNCTION IF EXISTS public.search_playground_duplicate_candidates(text, text, uuid, integer);

CREATE FUNCTION public.search_playground_duplicate_candidates(
  p_title text,
  p_structure_name text,
  p_exclude_workflow_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  structure_name text,
  commune text,
  status text,
  score real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT candidate.id, candidate.title, candidate.structure_name, candidate.commune, candidate.status, candidate.score
  FROM (
    SELECT
      we.id,
      we.title,
      we.structure_name,
      we.commune,
      concat_ws(', ',
        CASE we.computed_online_status WHEN 'published' THEN 'Publié' WHEN 'archived' THEN 'Archivé' END,
        CASE we.computed_work_status WHEN 'to_process' THEN 'À traiter' WHEN 'draft' THEN 'En cours' END
      ) AS status,
      public.word_similarity(p_title, we.title) AS title_score,
      public.word_similarity(coalesce(p_structure_name, ''), we.structure_name) AS structure_score,
      -- Same weights as the RI search: the structure is a strong signal.
      (public.word_similarity(p_title, we.title)
        + 1.5 * public.word_similarity(coalesce(p_structure_name, ''), we.structure_name))::real AS score
    FROM public.workflows_enriched we
    WHERE (we.computed_work_status IS NOT NULL OR we.computed_online_status IS NOT NULL)
      AND we.id <> p_exclude_workflow_id
  ) candidate
  WHERE candidate.title_score >= 0.3 OR candidate.structure_score >= 0.6
  ORDER BY candidate.score DESC
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION public.search_playground_duplicate_candidates(text, text, uuid, integer) IS
  'Shortlists playground documents with a status (not waiting for arbitration) close to an RCO record, for the duplicate arbitration.';

REVOKE EXECUTE ON FUNCTION public.search_playground_duplicate_candidates(text, text, uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.search_playground_duplicate_candidates(text, text, uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.search_playground_duplicate_candidates(text, text, uuid, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.search_playground_duplicate_candidates(text, text, uuid, integer) TO service_role;
