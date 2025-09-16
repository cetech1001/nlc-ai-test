/*
  Warnings:

  - You are about to alter the column `status` on the `email_threads` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - The `status` column on the `leads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `scheduled_emails` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[systemKey]` on the table `email_templates` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdAt` on table `admins` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `admins` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isPrimary` on table `email_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `email_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `syncEnabled` on table `email_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastSyncAt` on table `email_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `email_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `email_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `email_threads` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `email_threads` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `webhook_events` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."EmailCategory" AS ENUM ('thread_reply', 'sequence_email', 'transactional', 'notification');

-- CreateEnum
CREATE TYPE "public"."TemplateType" AS ENUM ('user', 'system');

-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('contacted', 'scheduled', 'converted', 'unresponsive');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."EmailStatus" ADD VALUE 'paused';
ALTER TYPE "public"."EmailStatus" ADD VALUE 'cancelled';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TemplateCategory" ADD VALUE 'custom';
ALTER TYPE "public"."TemplateCategory" ADD VALUE 'notification';
ALTER TYPE "public"."TemplateCategory" ADD VALUE 'transactional';

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_emailThreadID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_threads" DROP CONSTRAINT "email_threads_emailAccountID_fkey";

-- DropForeignKey
ALTER TABLE "public"."scheduled_emails" DROP CONSTRAINT "scheduled_emails_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."scheduled_emails" DROP CONSTRAINT "scheduled_emails_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."scheduled_emails" DROP CONSTRAINT "scheduled_emails_emailSequenceID_fkey";

-- DropForeignKey
ALTER TABLE "public"."scheduled_emails" DROP CONSTRAINT "scheduled_emails_leadID_fkey";

-- DropIndex
DROP INDEX "public"."email_messages_status_idx";

-- DropIndex
DROP INDEX "public"."idx_email_messages_sent_at";

-- DropIndex
DROP INDEX "public"."idx_email_messages_thread_id";

-- AlterTable
ALTER TABLE "public"."admins" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_accounts" ALTER COLUMN "isPrimary" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "syncEnabled" SET NOT NULL,
ALTER COLUMN "lastSyncAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_messages" ADD COLUMN     "clientID" UUID,
ADD COLUMN     "coachID" UUID,
ADD COLUMN     "deliveredAt" TIMESTAMPTZ(6),
ADD COLUMN     "emailProvider" VARCHAR(50),
ADD COLUMN     "emailSequenceID" UUID,
ADD COLUMN     "leadID" UUID,
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledFor" TIMESTAMPTZ(6),
ADD COLUMN     "sequenceOrder" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6),
ALTER COLUMN "status" SET DEFAULT 'scheduled',
ALTER COLUMN "sentAt" DROP NOT NULL,
ALTER COLUMN "emailThreadID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_templates" ADD COLUMN     "description" VARCHAR(500),
ADD COLUMN     "isDefault" BOOLEAN DEFAULT false,
ADD COLUMN     "systemKey" VARCHAR(100),
ADD COLUMN     "templateType" "public"."TemplateType" NOT NULL DEFAULT 'user',
ADD COLUMN     "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "userID" DROP NOT NULL,
ALTER COLUMN "userType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_threads" ADD COLUMN     "coachID" UUID,
ADD COLUMN     "leadID" UUID,
ALTER COLUMN "status" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "clientType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."leads" DROP COLUMN "status",
ADD COLUMN     "status" "public"."LeadStatus" NOT NULL DEFAULT 'contacted';

-- AlterTable
ALTER TABLE "public"."webhook_events" ALTER COLUMN "createdAt" SET NOT NULL;

-- DropTable
DROP TABLE "public"."scheduled_emails";

-- CreateIndex
CREATE INDEX "email_messages_status_scheduledFor_idx" ON "public"."email_messages"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "email_messages_coachID_status_idx" ON "public"."email_messages"("coachID", "status");

-- CreateIndex
CREATE INDEX "email_messages_clientID_sentAt_idx" ON "public"."email_messages"("clientID", "sentAt");

-- CreateIndex
CREATE INDEX "email_messages_leadID_sentAt_idx" ON "public"."email_messages"("leadID", "sentAt");

-- CreateIndex
CREATE INDEX "email_messages_emailSequenceID_sequenceOrder_idx" ON "public"."email_messages"("emailSequenceID", "sequenceOrder");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_systemKey_key" ON "public"."email_templates"("systemKey");

-- CreateIndex
CREATE INDEX "email_templates_templateType_category_idx" ON "public"."email_templates"("templateType", "category");

-- CreateIndex
CREATE INDEX "email_templates_userID_userType_category_idx" ON "public"."email_templates"("userID", "userType", "category");

-- CreateIndex
CREATE INDEX "email_templates_systemKey_idx" ON "public"."email_templates"("systemKey");

-- CreateIndex
CREATE INDEX "email_threads_coachID_isRead_idx" ON "public"."email_threads"("coachID", "isRead");

-- CreateIndex
CREATE INDEX "email_threads_clientID_status_idx" ON "public"."email_threads"("clientID", "status");

-- CreateIndex
CREATE INDEX "email_threads_leadID_status_idx" ON "public"."email_threads"("leadID", "status");

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_emailThreadID_fkey" FOREIGN KEY ("emailThreadID") REFERENCES "public"."email_threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_emailSequenceID_fkey" FOREIGN KEY ("emailSequenceID") REFERENCES "public"."email_sequences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_leadID_fkey" FOREIGN KEY ("leadID") REFERENCES "public"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_threads" ADD CONSTRAINT "email_threads_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_threads" ADD CONSTRAINT "email_threads_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_threads" ADD CONSTRAINT "email_threads_leadID_fkey" FOREIGN KEY ("leadID") REFERENCES "public"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_threads" ADD CONSTRAINT "email_threads_emailAccountID_fkey" FOREIGN KEY ("emailAccountID") REFERENCES "public"."email_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
