-- 1) Add the new column as nullable so existing rows don’t violate constraints
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);

-- 2) Backfill name from firstName + lastName IF those columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'firstName'
  ) OR EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'lastName'
  ) THEN
    EXECUTE $upd$
UPDATE "leads"
SET "name" = COALESCE(
  NULLIF(trim(both ' ' from concat_ws(' ', "firstName", "lastName")), ''),
  'Unknown'
             )
WHERE "name" IS NULL
  $upd$;
END IF;
END
$$;

-- 3) Make column required (NOT NULL)
ALTER TABLE "leads" ALTER COLUMN "name" SET NOT NULL;

-- 4) Drop old columns if they exist (safe both in shadow and real DB)
ALTER TABLE "leads" DROP COLUMN IF EXISTS "firstName";
ALTER TABLE "leads" DROP COLUMN IF EXISTS "lastName";
