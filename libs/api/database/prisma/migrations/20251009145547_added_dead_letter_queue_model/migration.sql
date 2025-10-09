-- CreateEnum
CREATE TYPE "public"."DLQStatus" AS ENUM ('pending_review', 'reviewed', 'requeued', 'discarded');

-- AlterEnum
ALTER TYPE "public"."EventOutboxStatus" ADD VALUE 'moved_to_dlq';

-- CreateTable
CREATE TABLE "public"."dead_letter_queue" (
    "id" UUID NOT NULL,
    "originalEventID" UUID NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "routingKey" VARCHAR(100) NOT NULL,
    "payload" TEXT NOT NULL,
    "failureReason" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL,
    "status" "public"."DLQStatus" NOT NULL DEFAULT 'pending_review',
    "reviewNotes" TEXT,
    "originalCreatedAt" TIMESTAMPTZ(6) NOT NULL,
    "movedToDLQAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ(6),
    "reviewedBy" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dead_letter_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dead_letter_queue_originalEventID_key" ON "public"."dead_letter_queue"("originalEventID");

-- CreateIndex
CREATE INDEX "dead_letter_queue_status_idx" ON "public"."dead_letter_queue"("status");

-- CreateIndex
CREATE INDEX "dead_letter_queue_eventType_idx" ON "public"."dead_letter_queue"("eventType");

-- CreateIndex
CREATE INDEX "dead_letter_queue_movedToDLQAt_idx" ON "public"."dead_letter_queue"("movedToDLQAt");

-- CreateIndex
CREATE INDEX "dead_letter_queue_originalCreatedAt_idx" ON "public"."dead_letter_queue"("originalCreatedAt");
