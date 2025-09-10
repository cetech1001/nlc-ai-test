-- AlterTable
ALTER TABLE "public"."email_messages" ADD COLUMN     "bcc" TEXT[],
ADD COLUMN     "cc" TEXT[],
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
