-- AlterTable
ALTER TABLE "public"."email_accounts" ALTER COLUMN "provider" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."email_threads" ADD COLUMN     "participantType" "public"."UserType";
