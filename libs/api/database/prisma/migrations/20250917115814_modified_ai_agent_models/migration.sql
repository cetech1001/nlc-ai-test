/*
  Warnings:

  - You are about to drop the column `clientID` on the `ai_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `ai_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `clientID` on the `generated_email_responses` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `generated_email_responses` table. All the data in the column will be lost.
  - Added the required column `userID` to the `ai_interactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `ai_interactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `generated_email_responses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `generated_email_responses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ai_interactions" DROP CONSTRAINT "ai_interactions_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."ai_interactions" DROP CONSTRAINT "ai_interactions_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."generated_email_responses" DROP CONSTRAINT "generated_email_responses_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."generated_email_responses" DROP CONSTRAINT "generated_email_responses_coachID_fkey";

-- DropIndex
DROP INDEX "public"."idx_ai_interactions_coach_id";

-- DropIndex
DROP INDEX "public"."generated_email_responses_coachID_status_idx";

-- AlterTable
ALTER TABLE "public"."ai_interactions" DROP COLUMN "clientID",
DROP COLUMN "coachID",
ADD COLUMN     "clientId" UUID,
ADD COLUMN     "coachId" UUID,
ADD COLUMN     "userID" UUID NOT NULL,
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."generated_email_responses" DROP COLUMN "clientID",
DROP COLUMN "coachID",
ADD COLUMN     "clientId" UUID,
ADD COLUMN     "coachId" UUID,
ADD COLUMN     "userID" UUID NOT NULL,
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- CreateIndex
CREATE INDEX "idx_ai_interactions_user_id" ON "public"."ai_interactions"("userID");

-- CreateIndex
CREATE INDEX "generated_email_responses_userID_status_idx" ON "public"."generated_email_responses"("userID", "status");

-- AddForeignKey
ALTER TABLE "public"."ai_interactions" ADD CONSTRAINT "ai_interactions_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_interactions" ADD CONSTRAINT "ai_interactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_email_responses" ADD CONSTRAINT "generated_email_responses_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_email_responses" ADD CONSTRAINT "generated_email_responses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
