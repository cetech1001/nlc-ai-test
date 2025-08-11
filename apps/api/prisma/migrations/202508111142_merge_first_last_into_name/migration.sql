-- Merge firstName and lastName into name for leads, then drop old columns
-- This migration is written for PostgreSQL

-- 1) Add the new column as nullable so existing rows don’t violate constraints
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);

-- 2) Backfill name from firstName + lastName (handles NULLs and extra spaces)
-- If both are NULL/empty, set a placeholder so we can enforce NOT NULL
UPDATE "leads"
SET "name" = COALESCE(NULLIF(trim(both ' ' from concat_ws(' ', "firstName", "lastName")), ''), 'Unknown')
WHERE "name" IS NULL;

-- 3) Make column required (NOT NULL)
ALTER TABLE "leads" ALTER COLUMN "name" SET NOT NULL;

-- 4) Drop old columns if they exist
ALTER TABLE "leads" DROP COLUMN IF EXISTS "firstName";
ALTER TABLE "leads" DROP COLUMN IF EXISTS "lastName";
