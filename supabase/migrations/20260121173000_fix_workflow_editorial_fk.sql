-- Modify the foreign key constraint on workflows.editorial_record_id
-- to allow deletion of editorial_records (sets the reference to NULL)

ALTER TABLE "public"."workflows"
DROP CONSTRAINT "status_editorial_record_id_fkey";

ALTER TABLE "public"."workflows"
ADD CONSTRAINT "status_editorial_record_id_fkey"
FOREIGN KEY ("editorial_record_id")
REFERENCES "public"."editorial_records"("id")
ON DELETE SET NULL;
