/*
  Warnings:

  - The values [aws_s3] on the enum `MediaProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MediaProvider_new" AS ENUM ('cloudinary', 'vimeo', 'cloudfront', 'S3');
ALTER TABLE "public"."media_files" ALTER COLUMN "provider" TYPE "public"."MediaProvider_new" USING ("provider"::text::"public"."MediaProvider_new");
ALTER TYPE "public"."MediaProvider" RENAME TO "MediaProvider_old";
ALTER TYPE "public"."MediaProvider_new" RENAME TO "MediaProvider";
DROP TYPE "public"."MediaProvider_old";
COMMIT;
