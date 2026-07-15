-- Add 'to_review' (À relire) to the editorial_records work_status check constraint.
-- Original constraint: work_status IN ('to_process', 'draft')
-- New constraint:      work_status IN ('to_process', 'draft', 'to_review')

ALTER TABLE editorial_records
  DROP CONSTRAINT IF EXISTS editorial_records_work_status_check;

ALTER TABLE editorial_records
  DROP CONSTRAINT IF EXISTS work_status_check;

ALTER TABLE editorial_records
  ADD CONSTRAINT editorial_records_work_status_check
    CHECK (work_status IS NULL OR work_status IN ('to_process', 'draft', 'to_review'));