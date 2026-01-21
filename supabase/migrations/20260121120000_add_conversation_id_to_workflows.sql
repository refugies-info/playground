-- Migration: Add conversation_id to workflows table
-- Purpose: Store Letta conversation ID to maintain context across workflow steps

ALTER TABLE "public"."workflows"
ADD COLUMN "conversation_id" text;

COMMENT ON COLUMN "public"."workflows"."conversation_id" IS 'ID of the Letta conversation associated with this workflow';
