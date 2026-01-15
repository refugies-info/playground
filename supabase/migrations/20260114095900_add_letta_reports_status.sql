-- Migration: Add status and raw_response columns to letta_reports
-- Purpose: Enable tracking of incomplete agent responses for debugging

-- Step 1: Clean up existing incomplete letta_reports
-- (those with empty/null markdown or metadata before adding constraints)
DELETE FROM "public"."letta_reports"
WHERE markdown IS NULL
   OR markdown = ''
   OR metadata IS NULL;

-- Step 2: Add status column to track report completion
ALTER TABLE "public"."letta_reports"
ADD COLUMN "status" text NOT NULL DEFAULT 'complete';

-- Step 3: Add raw_response column for storing incomplete agent responses
ALTER TABLE "public"."letta_reports"
ADD COLUMN "raw_response" text;

-- Step 4: Add check constraint for valid status values
ALTER TABLE "public"."letta_reports"
ADD CONSTRAINT "letta_reports_status_check"
CHECK (status IN ('complete', 'incomplete'));

-- Step 5: Add comments for clarity
COMMENT ON COLUMN "public"."letta_reports"."status"
IS 'Response status: complete (valid frontmatter parsed) or incomplete (fallback/error response)';

COMMENT ON COLUMN "public"."letta_reports"."raw_response"
IS 'Raw agent response text when status is incomplete, for debugging purposes';
