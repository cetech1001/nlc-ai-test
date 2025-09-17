/*
  Warnings:

  - The `status` column on the `generated_email_responses` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."GeneratedEmailStatus" AS ENUM ('generated', 'updated', 'scheduled', 'sent', 'failed', 'cancelled', 'superseded');

-- AlterTable
ALTER TABLE "public"."generated_email_responses" DROP COLUMN "status",
ADD COLUMN     "status" "public"."GeneratedEmailStatus" NOT NULL DEFAULT 'generated';

-- CreateIndex
CREATE INDEX "generated_email_responses_coachID_status_idx" ON "public"."generated_email_responses"("coachID", "status");
