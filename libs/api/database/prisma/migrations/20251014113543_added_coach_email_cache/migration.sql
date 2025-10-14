/*
  Warnings:

  - You are about to drop the column `clientID` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `leadID` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `clientID` on the `email_sequences` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `email_sequences` table. All the data in the column will be lost.
  - You are about to drop the column `leadID` on the `email_sequences` table. All the data in the column will be lost.
  - The `participantType` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."FineTuningJobStatus" AS ENUM ('pending', 'preparing_data', 'running', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."EmailParticipantType" AS ENUM ('coach', 'client', 'lead');

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_leadID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_sequences" DROP CONSTRAINT "email_sequences_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_sequences" DROP CONSTRAINT "email_sequences_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_sequences" DROP CONSTRAINT "email_sequences_leadID_fkey";

-- DropIndex
DROP INDEX "public"."email_sequences_clientID_idx";

-- DropIndex
DROP INDEX "public"."email_sequences_coachID_idx";

-- DropIndex
DROP INDEX "public"."email_sequences_leadID_idx";

-- AlterTable
ALTER TABLE "public"."CoachAiAgent" ADD COLUMN     "fineTuningEmailCount" INTEGER DEFAULT 0,
ADD COLUMN     "lastFineTuningAt" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "public"."email_messages" DROP COLUMN "clientID",
DROP COLUMN "coachID",
DROP COLUMN "leadID";

-- AlterTable
ALTER TABLE "public"."email_sequences" DROP COLUMN "clientID",
DROP COLUMN "coachID",
DROP COLUMN "leadID",
ADD COLUMN     "targetID" UUID,
ADD COLUMN     "targetType" "public"."EmailParticipantType",
ALTER COLUMN "sequence" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "public"."email_threads" DROP COLUMN "participantType",
ADD COLUMN     "participantType" "public"."EmailParticipantType";

-- DropEnum
DROP TYPE "public"."EmailThreadParticipantType";

-- CreateTable
CREATE TABLE "public"."fine_tuning_jobs" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "assistantID" VARCHAR(255) NOT NULL,
    "s3DatasetKey" VARCHAR(500) NOT NULL,
    "emailCount" INTEGER NOT NULL,
    "openaiJobID" VARCHAR(255),
    "openaiFileID" VARCHAR(255),
    "fineTunedModelID" VARCHAR(255),
    "status" "public"."FineTuningJobStatus" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "trainedOn" TIMESTAMPTZ(6) NOT NULL,
    "dateFrom" TIMESTAMPTZ(6) NOT NULL,
    "dateTo" TIMESTAMPTZ(6) NOT NULL,
    "trainingMetrics" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fine_tuning_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coach_email_cache" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "threadID" VARCHAR(255) NOT NULL,
    "messageID" VARCHAR(255) NOT NULL,
    "s3Key" VARCHAR(500) NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500),
    "isFromCoach" BOOLEAN NOT NULL,
    "isToClientOrLead" BOOLEAN NOT NULL,
    "includedInFineTuning" BOOLEAN NOT NULL DEFAULT false,
    "fineTuningJobID" UUID,
    "sentAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_email_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fine_tuning_jobs_coachID_idx" ON "public"."fine_tuning_jobs"("coachID");

-- CreateIndex
CREATE INDEX "fine_tuning_jobs_status_idx" ON "public"."fine_tuning_jobs"("status");

-- CreateIndex
CREATE INDEX "fine_tuning_jobs_createdAt_idx" ON "public"."fine_tuning_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "coach_email_cache_coachID_isFromCoach_idx" ON "public"."coach_email_cache"("coachID", "isFromCoach");

-- CreateIndex
CREATE INDEX "coach_email_cache_coachID_includedInFineTuning_idx" ON "public"."coach_email_cache"("coachID", "includedInFineTuning");

-- CreateIndex
CREATE INDEX "coach_email_cache_threadID_idx" ON "public"."coach_email_cache"("threadID");

-- CreateIndex
CREATE INDEX "coach_email_cache_sentAt_idx" ON "public"."coach_email_cache"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "coach_email_cache_coachID_messageID_key" ON "public"."coach_email_cache"("coachID", "messageID");
