/*
  Warnings:

  - You are about to drop the column `clientId` on the `ai_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `ai_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `deliverability_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `deliverability_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `recipientType` on the `deliverability_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `deliverability_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `syncSettings` on the `email_accounts` table. All the data in the column will be lost.
  - The `provider` column on the `email_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `aiProcessed` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `clientID` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `intentCategory` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `leadID` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `maxRetries` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `receivedAt` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `sentimentScore` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `sequenceOrder` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `suggestedActions` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `clientType` on the `email_threads` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `email_threads` table. All the data in the column will be lost.
  - The `status` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `deliverabilityScore` on the `generated_email_responses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emailMessageID]` on the table `deliverability_analyses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailMessageID` to the `deliverability_analyses` table without a default value. This is not possible if the table is not empty.
  - Made the column `accessToken` on table `email_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenExpiresAt` on table `email_accounts` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userID` to the `email_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `email_messages` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `email_messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `email_messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isRead` on table `email_threads` required. This step will fail if there are existing NULL values in that column.
  - Made the column `messageCount` on table `email_threads` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."EmailProviders" AS ENUM ('gmail', 'outlook');

-- CreateEnum
CREATE TYPE "public"."EmailThreadPriority" AS ENUM ('high', 'normal', 'low');

-- CreateEnum
CREATE TYPE "public"."EmailThreadStatus" AS ENUM ('active', 'archived');

-- DropForeignKey
ALTER TABLE "public"."ai_interactions" DROP CONSTRAINT "ai_interactions_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ai_interactions" DROP CONSTRAINT "ai_interactions_coachId_fkey";

-- DropForeignKey
ALTER TABLE "public"."deliverability_analyses" DROP CONSTRAINT "deliverability_analyses_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_leadID_fkey";

-- DropIndex
DROP INDEX "public"."deliverability_analyses_coachID_idx";

-- DropIndex
DROP INDEX "public"."deliverability_analyses_createdAt_idx";

-- DropIndex
DROP INDEX "public"."email_messages_clientID_sentAt_idx";

-- DropIndex
DROP INDEX "public"."email_messages_coachID_status_idx";

-- DropIndex
DROP INDEX "public"."email_messages_emailSequenceID_sequenceOrder_idx";

-- DropIndex
DROP INDEX "public"."email_messages_leadID_sentAt_idx";

-- DropIndex
DROP INDEX "public"."email_threads_clientID_status_idx";

-- DropIndex
DROP INDEX "public"."email_threads_coachID_isRead_idx";

-- DropIndex
DROP INDEX "public"."email_threads_leadID_status_idx";

-- DropIndex
DROP INDEX "public"."generated_email_responses_createdAt_idx";

-- DropIndex
DROP INDEX "public"."generated_email_responses_userID_status_idx";

-- AlterTable
ALTER TABLE "public"."ai_interactions" DROP COLUMN "clientId",
DROP COLUMN "coachId",
ADD COLUMN     "clientID" UUID,
ADD COLUMN     "coachID" UUID;

-- AlterTable
ALTER TABLE "public"."deliverability_analyses" DROP COLUMN "body",
DROP COLUMN "coachID",
DROP COLUMN "recipientType",
DROP COLUMN "subject",
ADD COLUMN     "coachId" UUID,
ADD COLUMN     "emailMessageID" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_accounts" DROP COLUMN "syncSettings",
DROP COLUMN "provider",
ADD COLUMN     "provider" "public"."EmailProviders" NOT NULL DEFAULT 'gmail',
ALTER COLUMN "accessToken" SET NOT NULL,
ALTER COLUMN "tokenExpiresAt" SET NOT NULL,
ALTER COLUMN "lastSyncAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."email_messages" DROP COLUMN "aiProcessed",
DROP COLUMN "clientID",
DROP COLUMN "coachID",
DROP COLUMN "intentCategory",
DROP COLUMN "leadID",
DROP COLUMN "maxRetries",
DROP COLUMN "receivedAt",
DROP COLUMN "sentimentScore",
DROP COLUMN "sequenceOrder",
DROP COLUMN "suggestedActions",
DROP COLUMN "tags",
ADD COLUMN     "clientId" UUID,
ADD COLUMN     "coachId" UUID,
ADD COLUMN     "deliverabilityAnalysisID" UUID,
ADD COLUMN     "userID" UUID NOT NULL,
ADD COLUMN     "userType" "public"."UserType" NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_threads" DROP COLUMN "clientType",
DROP COLUMN "tags",
ADD COLUMN     "s3Bucket" VARCHAR(100),
ADD COLUMN     "s3KeyPrefix" VARCHAR(500),
DROP COLUMN "status",
ADD COLUMN     "status" "public"."EmailThreadStatus" NOT NULL DEFAULT 'active',
ALTER COLUMN "isRead" SET NOT NULL,
DROP COLUMN "priority",
ADD COLUMN     "priority" "public"."EmailThreadPriority" NOT NULL DEFAULT 'normal',
ALTER COLUMN "messageCount" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."generated_email_responses" DROP COLUMN "deliverabilityScore";

-- CreateIndex
CREATE UNIQUE INDEX "deliverability_analyses_emailMessageID_key" ON "public"."deliverability_analyses"("emailMessageID");

-- CreateIndex
CREATE INDEX "deliverability_analyses_emailMessageID_idx" ON "public"."deliverability_analyses"("emailMessageID");

-- CreateIndex
CREATE INDEX "email_messages_userID_userType_idx" ON "public"."email_messages"("userID", "userType");

-- CreateIndex
CREATE INDEX "email_messages_emailThreadID_idx" ON "public"."email_messages"("emailThreadID");

-- CreateIndex
CREATE INDEX "email_threads_userID_userType_idx" ON "public"."email_threads"("userID", "userType");

-- CreateIndex
CREATE INDEX "email_threads_emailAccountID_idx" ON "public"."email_threads"("emailAccountID");

-- CreateIndex
CREATE INDEX "email_threads_coachID_idx" ON "public"."email_threads"("coachID");

-- CreateIndex
CREATE INDEX "email_threads_clientID_idx" ON "public"."email_threads"("clientID");

-- CreateIndex
CREATE INDEX "email_threads_leadID_idx" ON "public"."email_threads"("leadID");

-- CreateIndex
CREATE INDEX "email_threads_lastMessageAt_idx" ON "public"."email_threads"("lastMessageAt");

-- CreateIndex
CREATE INDEX "generated_email_responses_userID_userType_idx" ON "public"."generated_email_responses"("userID", "userType");

-- CreateIndex
CREATE INDEX "generated_email_responses_status_idx" ON "public"."generated_email_responses"("status");

-- AddForeignKey
ALTER TABLE "public"."ai_interactions" ADD CONSTRAINT "ai_interactions_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_interactions" ADD CONSTRAINT "ai_interactions_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deliverability_analyses" ADD CONSTRAINT "deliverability_analyses_emailMessageID_fkey" FOREIGN KEY ("emailMessageID") REFERENCES "public"."email_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deliverability_analyses" ADD CONSTRAINT "deliverability_analyses_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."idx_email_accounts_user" RENAME TO "email_accounts_userID_userType_idx";
