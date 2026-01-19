-- Migration: Add conversation_id column to letta_reports
-- Purpose: Store Letta conversation ID (conv-xxx) for each report to enable
-- tracking of conversation threads and enable better debugging/message history

ALTER TABLE "public"."letta_reports"
ADD COLUMN "conversation_id" text;

-- Add comment for clarity
COMMENT ON COLUMN "public"."letta_reports"."conversation_id"
IS 'Letta conversation ID (conv-xxx format) used for this report. Nullable for backwards compatibility.';
