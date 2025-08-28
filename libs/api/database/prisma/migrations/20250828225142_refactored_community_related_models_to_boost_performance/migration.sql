/*
  Warnings:

  - You are about to drop the column `authorAvatarUrl` on the `post_comments` table. All the data in the column will be lost.
  - You are about to drop the column `authorID` on the `post_comments` table. All the data in the column will be lost.
  - You are about to drop the column `authorName` on the `post_comments` table. All the data in the column will be lost.
  - You are about to drop the column `authorType` on the `post_comments` table. All the data in the column will be lost.
  - You are about to drop the column `authorAvatarUrl` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `authorID` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `authorName` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `authorType` on the `posts` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `community_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `community_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `communityMemberID` to the `post_comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `communityMemberID` to the `posts` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns to community_members with defaults first
ALTER TABLE "public"."community_members"
  ADD COLUMN "userAvatarUrl" TEXT,
ADD COLUMN "userEmail" VARCHAR(255) DEFAULT 'unknown@example.com',
ADD COLUMN "userName" VARCHAR(255) DEFAULT 'Unknown User';

-- Step 2: Update existing community_members with actual user data
UPDATE "public"."community_members"
SET
  "userEmail" = CASE
                  WHEN "userType" = 'coach' THEN (
                    SELECT "email" FROM "coaches" WHERE "coaches"."id" = "community_members"."userID"
                  )
                  WHEN "userType" = 'client' THEN (
                    SELECT "email" FROM "clients" WHERE "clients"."id" = "community_members"."userID"
                  )
                  WHEN "userType" = 'admin' THEN (
                    SELECT "email" FROM "admins" WHERE "admins"."id" = "community_members"."userID"
                  )
                  ELSE "userEmail" -- Keep default if no match
    END,
  "userName" = CASE
                 WHEN "userType" = 'coach' THEN (
                   SELECT COALESCE("businessName", CONCAT("firstName", ' ', "lastName"), 'Unknown Coach')
                   FROM "coaches" WHERE "coaches"."id" = "community_members"."userID"
                 )
                 WHEN "userType" = 'client' THEN (
                   SELECT CONCAT("firstName", ' ', "lastName")
                   FROM "clients" WHERE "clients"."id" = "community_members"."userID"
                 )
                 WHEN "userType" = 'admin' THEN (
                   SELECT CONCAT("firstName", ' ', "lastName")
                   FROM "admins" WHERE "admins"."id" = "community_members"."userID"
                 )
                 ELSE "userName" -- Keep default if no match
    END,
  "userAvatarUrl" = CASE
                      WHEN "userType" = 'coach' THEN (
                        SELECT "avatarUrl" FROM "coaches" WHERE "coaches"."id" = "community_members"."userID"
                      )
                      WHEN "userType" = 'client' THEN (
                        SELECT "avatarUrl" FROM "clients" WHERE "clients"."id" = "community_members"."userID"
                      )
                      WHEN "userType" = 'admin' THEN (
                        SELECT "avatarUrl" FROM "admins" WHERE "admins"."id" = "community_members"."userID"
                      )
                      ELSE "userAvatarUrl" -- Keep NULL if no match
    END
WHERE "userEmail" = 'unknown@example.com' OR "userName" = 'Unknown User';

-- Step 3: Remove defaults and make columns required
ALTER TABLE "public"."community_members" ALTER COLUMN "userEmail" DROP DEFAULT;
ALTER TABLE "public"."community_members" ALTER COLUMN "userName" DROP DEFAULT;
ALTER TABLE "public"."community_members" ALTER COLUMN "userEmail" SET NOT NULL;
ALTER TABLE "public"."community_members" ALTER COLUMN "userName" SET NOT NULL;

-- Step 4: Add communityMemberID columns to posts with temporary default
ALTER TABLE "public"."posts" ADD COLUMN "communityMemberID_temp" UUID;
ALTER TABLE "public"."post_comments" ADD COLUMN "communityMemberID_temp" UUID;

-- Step 5: Map posts to community members
UPDATE "public"."posts"
SET "communityMemberID_temp" = (
  SELECT cm."id"
  FROM "community_members" cm
  WHERE cm."communityID" = "posts"."communityID"
    AND cm."userID" = "posts"."authorID"
    AND cm."userType" = "posts"."authorType"
  LIMIT 1
  );

-- Step 6: Map comments to community members
UPDATE "public"."post_comments"
SET "communityMemberID_temp" = (
  SELECT cm."id"
  FROM "community_members" cm
         JOIN "posts" p ON p."communityID" = cm."communityID"
  WHERE cm."userID" = "post_comments"."authorID"
    AND cm."userType" = "post_comments"."authorType"
    AND p."id" = "post_comments"."postID"
  LIMIT 1
  );

-- Step 7: Handle any orphaned posts/comments by creating community memberships
-- For posts without matching community members
INSERT INTO "public"."community_members" ("id", "communityID", "userID", "userType", "userName", "userEmail", "userAvatarUrl", "role", "status", "joinedAt")
SELECT
  gen_random_uuid(),
  p."communityID",
  p."authorID",
  p."authorType",
  p."authorName",
  CASE
    WHEN p."authorType" = 'coach' THEN COALESCE((SELECT "email" FROM "coaches" WHERE "id" = p."authorID"), 'unknown@example.com')
    WHEN p."authorType" = 'client' THEN COALESCE((SELECT "email" FROM "clients" WHERE "id" = p."authorID"), 'unknown@example.com')
    WHEN p."authorType" = 'admin' THEN COALESCE((SELECT "email" FROM "admins" WHERE "id" = p."authorID"), 'unknown@example.com')
    ELSE 'unknown@example.com'
    END,
  p."authorAvatarUrl",
  'member'::"public"."MemberRole",
  'active'::"public"."MemberStatus",
  NOW()
FROM "public"."posts" p
WHERE p."communityMemberID_temp" IS NULL
GROUP BY p."communityID", p."authorID", p."authorType", p."authorName", p."authorAvatarUrl";

-- Update posts with the newly created community members
UPDATE "public"."posts"
SET "communityMemberID_temp" = (
  SELECT cm."id"
  FROM "community_members" cm
  WHERE cm."communityID" = "posts"."communityID"
    AND cm."userID" = "posts"."authorID"
    AND cm."userType" = "posts"."authorType"
  LIMIT 1
  )
WHERE "communityMemberID_temp" IS NULL;

-- For comments without matching community members
INSERT INTO "public"."community_members" ("id", "communityID", "userID", "userType", "userName", "userEmail", "userAvatarUrl", "role", "status", "joinedAt")
SELECT DISTINCT
  gen_random_uuid(),
  p."communityID",
  pc."authorID",
  pc."authorType",
  pc."authorName",
  CASE
    WHEN pc."authorType" = 'coach' THEN COALESCE((SELECT "email" FROM "coaches" WHERE "id" = pc."authorID"), 'unknown@example.com')
    WHEN pc."authorType" = 'client' THEN COALESCE((SELECT "email" FROM "clients" WHERE "id" = pc."authorID"), 'unknown@example.com')
    WHEN pc."authorType" = 'admin' THEN COALESCE((SELECT "email" FROM "admins" WHERE "id" = pc."authorID"), 'unknown@example.com')
    ELSE 'unknown@example.com'
    END,
  pc."authorAvatarUrl",
  'member'::"public"."MemberRole",
  'active'::"public"."MemberStatus",
  NOW()
FROM "public"."post_comments" pc
       JOIN "public"."posts" p ON p."id" = pc."postID"
WHERE pc."communityMemberID_temp" IS NULL
  AND NOT EXISTS (
  SELECT 1 FROM "community_members" cm
  WHERE cm."communityID" = p."communityID"
    AND cm."userID" = pc."authorID"
    AND cm."userType" = pc."authorType"
);

-- Update comments with community members
UPDATE "public"."post_comments"
SET "communityMemberID_temp" = (
  SELECT cm."id"
  FROM "community_members" cm
         JOIN "posts" p ON p."communityID" = cm."communityID"
  WHERE cm."userID" = "post_comments"."authorID"
    AND cm."userType" = "post_comments"."authorType"
    AND p."id" = "post_comments"."postID"
  LIMIT 1
  )
WHERE "communityMemberID_temp" IS NULL;

-- Step 8: Drop old indexes
DROP INDEX IF EXISTS "public"."post_comments_authorID_authorType_idx";
DROP INDEX IF EXISTS "public"."post_comments_authorName_idx";
DROP INDEX IF EXISTS "public"."posts_authorID_authorType_idx";
DROP INDEX IF EXISTS "public"."posts_authorName_idx";

-- Step 9: Rename temp columns and drop old columns
ALTER TABLE "public"."posts" RENAME COLUMN "communityMemberID_temp" TO "communityMemberID";
ALTER TABLE "public"."post_comments" RENAME COLUMN "communityMemberID_temp" TO "communityMemberID";

-- Make the new columns required
ALTER TABLE "public"."posts" ALTER COLUMN "communityMemberID" SET NOT NULL;
ALTER TABLE "public"."post_comments" ALTER COLUMN "communityMemberID" SET NOT NULL;

-- Drop old author columns
ALTER TABLE "public"."posts" DROP COLUMN IF EXISTS "authorAvatarUrl";
ALTER TABLE "public"."posts" DROP COLUMN IF EXISTS "authorID";
ALTER TABLE "public"."posts" DROP COLUMN IF EXISTS "authorName";
ALTER TABLE "public"."posts" DROP COLUMN IF EXISTS "authorType";

ALTER TABLE "public"."post_comments" DROP COLUMN IF EXISTS "authorAvatarUrl";
ALTER TABLE "public"."post_comments" DROP COLUMN IF EXISTS "authorID";
ALTER TABLE "public"."post_comments" DROP COLUMN IF EXISTS "authorName";
ALTER TABLE "public"."post_comments" DROP COLUMN IF EXISTS "authorType";

-- Step 10: Create new indexes
CREATE INDEX "community_members_userName_idx" ON "public"."community_members"("userName");
CREATE INDEX "community_members_userEmail_idx" ON "public"."community_members"("userEmail");
CREATE INDEX "post_comments_communityMemberID_idx" ON "public"."post_comments"("communityMemberID");
CREATE INDEX "posts_communityMemberID_idx" ON "public"."posts"("communityMemberID");

-- Step 11: Add foreign key constraints
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_communityMemberID_fkey" FOREIGN KEY ("communityMemberID") REFERENCES "public"."community_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."post_comments" ADD CONSTRAINT "post_comments_communityMemberID_fkey" FOREIGN KEY ("communityMemberID") REFERENCES "public"."community_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
