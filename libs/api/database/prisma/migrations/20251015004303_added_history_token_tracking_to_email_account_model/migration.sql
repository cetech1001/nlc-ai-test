-- AlterTable
ALTER TABLE "public"."email_accounts" ADD COLUMN     "lastHistoryID" VARCHAR(100),
ADD COLUMN     "lastSyncToken" VARCHAR(500);
