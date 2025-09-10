-- AlterTable
ALTER TABLE "public"."email_accounts" ADD COLUMN     "syncSettings" JSONB DEFAULT '{}';
