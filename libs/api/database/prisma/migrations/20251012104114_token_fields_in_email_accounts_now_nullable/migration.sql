-- AlterTable
ALTER TABLE "public"."email_accounts" ALTER COLUMN "accessToken" DROP NOT NULL,
ALTER COLUMN "tokenExpiresAt" DROP NOT NULL;
