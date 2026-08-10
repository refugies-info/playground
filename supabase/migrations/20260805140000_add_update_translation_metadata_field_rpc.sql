-- Migration: Add update_translation_metadata_field RPC function
-- Pendant de `update_metadata_field` (éditorial) pour les traductions : met à
-- jour une seule clé de translation_records.metadata sans remplacer l'objet.
-- Nécessaire car ce jsonb porte aussi le titre traduit, lu en repli par la
-- recherche de la liste des traductions — une écriture globale l'effacerait.

CREATE OR REPLACE FUNCTION update_translation_metadata_field(
  record_id UUID,
  field_key TEXT,
  field_value JSONB,
  delete_key BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF delete_key THEN
    -- Remove the key from metadata
    UPDATE translation_records
    SET
      metadata = metadata - field_key,
      updated_at = NOW()
    WHERE id = record_id;
  ELSE
    -- Set or update the key in metadata (including null values)
    UPDATE translation_records
    SET
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(field_key, field_value),
      updated_at = NOW()
    WHERE id = record_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_translation_metadata_field(UUID, TEXT, JSONB, BOOLEAN) TO authenticated;
