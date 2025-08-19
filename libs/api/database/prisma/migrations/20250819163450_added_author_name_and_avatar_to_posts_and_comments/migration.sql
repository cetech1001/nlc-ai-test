-- CreateEnum
-- Add author fields to posts table with default values
ALTER TABLE "posts"
  ADD COLUMN "authorName" VARCHAR(255) DEFAULT 'Unknown User',
ADD COLUMN "authorAvatarUrl" TEXT;

-- Add author fields to post_comments table with default values
ALTER TABLE "post_comments"
  ADD COLUMN "authorName" VARCHAR(255) DEFAULT 'Unknown User',
ADD COLUMN "authorAvatarUrl" TEXT;

-- Update existing posts with actual author names
UPDATE "posts" SET
                 "authorName" = CASE
                                  WHEN "authorType" = 'coach' THEN (
                                    SELECT COALESCE("businessName", CONCAT("firstName", ' ', "lastName"), 'Unknown Coach')
                                    FROM "coaches"
                                    WHERE "coaches"."id" = "posts"."authorID"
                                  )
                                  WHEN "authorType" = 'client' THEN (
                                    SELECT CONCAT("firstName", ' ', "lastName")
                                    FROM "clients"
                                    WHERE "clients"."id" = "posts"."authorID"
                                  )
                                  WHEN "authorType" = 'admin' THEN (
                                    SELECT CONCAT("firstName", ' ', "lastName")
                                    FROM "admins"
                                    WHERE "admins"."id" = "posts"."authorID"
                                  )
                                  ELSE 'Unknown User'
                   END,
                 "authorAvatarUrl" = CASE
                                       WHEN "authorType" = 'coach' THEN (
                                         SELECT "avatarUrl"
                                         FROM "coaches"
                                         WHERE "coaches"."id" = "posts"."authorID"
                                       )
                                       WHEN "authorType" = 'client' THEN (
                                         SELECT "avatarUrl"
                                         FROM "clients"
                                         WHERE "clients"."id" = "posts"."authorID"
                                       )
                                       WHEN "authorType" = 'admin' THEN (
                                         SELECT "avatarUrl"
                                         FROM "admins"
                                         WHERE "admins"."id" = "posts"."authorID"
                                       )
                                       ELSE NULL
                   END
WHERE "authorName" = 'Unknown User';

-- Update existing comments with actual author names
UPDATE "post_comments" SET
                         "authorName" = CASE
                                          WHEN "authorType" = 'coach' THEN (
                                            SELECT COALESCE("businessName", CONCAT("firstName", ' ', "lastName"), 'Unknown Coach')
                                            FROM "coaches"
                                            WHERE "coaches"."id" = "post_comments"."authorID"
                                          )
                                          WHEN "authorType" = 'client' THEN (
                                            SELECT CONCAT("firstName", ' ', "lastName")
                                            FROM "clients"
                                            WHERE "clients"."id" = "post_comments"."authorID"
                                          )
                                          WHEN "authorType" = 'admin' THEN (
                                            SELECT CONCAT("firstName", ' ', "lastName")
                                            FROM "admins"
                                            WHERE "admins"."id" = "post_comments"."authorID"
                                          )
                                          ELSE 'Unknown User'
                           END,
                         "authorAvatarUrl" = CASE
                                               WHEN "authorType" = 'coach' THEN (
                                                 SELECT "avatarUrl"
                                                 FROM "coaches"
                                                 WHERE "coaches"."id" = "post_comments"."authorID"
                                               )
                                               WHEN "authorType" = 'client' THEN (
                                                 SELECT "avatarUrl"
                                                 FROM "clients"
                                                 WHERE "clients"."id" = "post_comments"."authorID"
                                               )
                                               WHEN "authorType" = 'admin' THEN (
                                                 SELECT "avatarUrl"
                                                 FROM "admins"
                                                 WHERE "admins"."id" = "post_comments"."authorID"
                                               )
                                               ELSE NULL
                           END
WHERE "authorName" = 'Unknown User';

-- Now make the columns required (remove default)
ALTER TABLE "posts" ALTER COLUMN "authorName" SET NOT NULL;
ALTER TABLE "posts" ALTER COLUMN "authorName" DROP DEFAULT;

ALTER TABLE "post_comments" ALTER COLUMN "authorName" SET NOT NULL;
ALTER TABLE "post_comments" ALTER COLUMN "authorName" DROP DEFAULT;

-- Create indexes for better performance
CREATE INDEX "idx_posts_author_name" ON "posts"("authorName");
CREATE INDEX "idx_post_comments_author_name" ON "post_comments"("authorName");
