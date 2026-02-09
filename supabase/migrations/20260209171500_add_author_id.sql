-- Add author_id to editorial_records
ALTER TABLE "public"."editorial_records"
ADD COLUMN "author_id" uuid REFERENCES auth.users(id);

-- Add author_id to translation_records
ALTER TABLE "public"."translation_records"
ADD COLUMN "author_id" uuid REFERENCES auth.users(id);

-- Add author_id to publication_records
-- distinct from published_by: author is the content creator, published_by is the action performer
ALTER TABLE "public"."publication_records"
ADD COLUMN "author_id" uuid REFERENCES auth.users(id);
