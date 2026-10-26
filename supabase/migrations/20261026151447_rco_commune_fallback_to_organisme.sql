-- RCO fiches come from /recherche, which cannot return lieu_formation:
-- fall back to the city of the organisme responsable, which it does return.
CREATE OR REPLACE FUNCTION public.workflow_commune(
    origin text,
    editorial_metadata jsonb,
    ingestion_metadata jsonb
) RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
    SELECT COALESCE(
        editorial_metadata->>'commune',
        CASE origin
            WHEN 'RCO' THEN COALESCE(
                ingestion_metadata#>>'{sessions,0,lieu_formation,0,ville}',
                ingestion_metadata#>>'{organisme_responsable,coordonnees,ville}'
            )
            ELSE ingestion_metadata->>'commune'
        END
    )
$$;
