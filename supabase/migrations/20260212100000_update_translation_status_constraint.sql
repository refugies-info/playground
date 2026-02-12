-- Update translation_records work_status check constraint
-- Original constraint: work_status IN ('to_process', 'draft')
-- New constraint: work_status IN ('to_process', 'draft', 'pending', 'error')

-- 1. Drop existing check constraint
ALTER TABLE public.translation_records
DROP CONSTRAINT IF EXISTS translation_records_work_status_check;

-- 2. Add new check constraint
ALTER TABLE public.translation_records
ADD CONSTRAINT translation_records_work_status_check
CHECK (work_status IS NULL OR work_status IN ('to_process', 'draft', 'pending', 'error'));
