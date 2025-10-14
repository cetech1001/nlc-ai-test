-- AlterTable
ALTER TABLE "public"."email_threads" ADD COLUMN     "lastMessageFrom" VARCHAR(255),
ADD COLUMN     "lastMessageFromEmail" VARCHAR(255),
ADD COLUMN     "lastMessagePreview" VARCHAR(500),
ADD COLUMN     "participantEmail" VARCHAR(255),
ADD COLUMN     "participantName" VARCHAR(255);

-- CreateIndex
CREATE INDEX "email_threads_participantEmail_idx" ON "public"."email_threads"("participantEmail");
