-- Migration: rename activity_log_action enum value 'archivage' -> 'archive'
-- Rationale: the enum value drifted from the code constant. TYPE_ARCHIVE in
-- packages/shared/src/types/activity-log.ts is "archive", but the enum created in
-- 20260617084727_add_activity_logs.sql used the French 'archivage'. Archive inserts
-- (action: 'archive') therefore fail with "invalid input value for enum
-- activity_log_action: 'archive'"; recordActivity swallows the error, so archive
-- events never reach activity_logs. Align the DB to the code so the enum stays in
-- lockstep with ACTIVITY_LOG_TYPES (see comment in the original migration).

alter type public.activity_log_action rename value 'archivage' to 'archive';
