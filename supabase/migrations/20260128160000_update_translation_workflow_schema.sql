-- Add workflow_id to translation_records
ALTER TABLE translation_records ADD COLUMN workflow_id uuid REFERENCES workflows(id);

-- Drop translation_record_id from workflows
ALTER TABLE workflows DROP COLUMN IF EXISTS translation_record_id;
