-- CreateEnum
CREATE TYPE "public"."KnowledgeFileStatus" AS ENUM ('uploaded', 'indexed', 'failed', 'deleted');

-- CreateEnum
CREATE TYPE "public"."ReplicaThreadStatus" AS ENUM ('active', 'archived', 'deleted');

-- CreateTable
CREATE TABLE "public"."coach_ai_configs" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "assistantID" VARCHAR(255) NOT NULL,
    "vectorStoreID" VARCHAR(255) NOT NULL,
    "assistantName" VARCHAR(255) NOT NULL,
    "instructions" TEXT NOT NULL,
    "model" VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "coach_ai_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coach_knowledge_files" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "openaiFileID" VARCHAR(255) NOT NULL,
    "vectorStoreFileID" VARCHAR(255),
    "filename" VARCHAR(500) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "status" "public"."KnowledgeFileStatus" NOT NULL DEFAULT 'uploaded',
    "uploadedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMPTZ(6),
    "failedAt" TIMESTAMPTZ(6),
    "errorMessage" TEXT,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "coach_knowledge_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coach_replica_threads" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "openaiThreadID" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500),
    "status" "public"."ReplicaThreadStatus" NOT NULL DEFAULT 'active',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMPTZ(6),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "coach_replica_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coach_replica_messages" (
    "id" UUID NOT NULL,
    "threadID" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "messageID" VARCHAR(255),
    "runID" VARCHAR(255),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_replica_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coach_replica_usage" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" BIGINT NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(10,4) NOT NULL DEFAULT 0.00,
    "averageRunTime" INTEGER DEFAULT 0,
    "successfulRuns" INTEGER NOT NULL DEFAULT 0,
    "failedRuns" INTEGER NOT NULL DEFAULT 0,
    "filesUploaded" INTEGER NOT NULL DEFAULT 0,
    "totalStorageMB" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_replica_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coach_ai_configs_coachID_key" ON "public"."coach_ai_configs"("coachID");

-- CreateIndex
CREATE INDEX "coach_ai_configs_coachID_idx" ON "public"."coach_ai_configs"("coachID");

-- CreateIndex
CREATE INDEX "coach_ai_configs_assistantID_idx" ON "public"."coach_ai_configs"("assistantID");

-- CreateIndex
CREATE INDEX "coach_knowledge_files_coachID_idx" ON "public"."coach_knowledge_files"("coachID");

-- CreateIndex
CREATE INDEX "coach_knowledge_files_openaiFileID_idx" ON "public"."coach_knowledge_files"("openaiFileID");

-- CreateIndex
CREATE INDEX "coach_knowledge_files_status_idx" ON "public"."coach_knowledge_files"("status");

-- CreateIndex
CREATE INDEX "coach_knowledge_files_uploadedAt_idx" ON "public"."coach_knowledge_files"("uploadedAt");

-- CreateIndex
CREATE INDEX "coach_replica_threads_coachID_idx" ON "public"."coach_replica_threads"("coachID");

-- CreateIndex
CREATE INDEX "coach_replica_threads_openaiThreadID_idx" ON "public"."coach_replica_threads"("openaiThreadID");

-- CreateIndex
CREATE INDEX "coach_replica_threads_status_idx" ON "public"."coach_replica_threads"("status");

-- CreateIndex
CREATE INDEX "coach_replica_threads_lastMessageAt_idx" ON "public"."coach_replica_threads"("lastMessageAt");

-- CreateIndex
CREATE INDEX "coach_replica_messages_threadID_idx" ON "public"."coach_replica_messages"("threadID");

-- CreateIndex
CREATE INDEX "coach_replica_messages_coachID_idx" ON "public"."coach_replica_messages"("coachID");

-- CreateIndex
CREATE INDEX "coach_replica_messages_messageID_idx" ON "public"."coach_replica_messages"("messageID");

-- CreateIndex
CREATE INDEX "coach_replica_messages_createdAt_idx" ON "public"."coach_replica_messages"("createdAt");

-- CreateIndex
CREATE INDEX "coach_replica_usage_date_idx" ON "public"."coach_replica_usage"("date");

-- CreateIndex
CREATE INDEX "coach_replica_usage_coachID_idx" ON "public"."coach_replica_usage"("coachID");

-- CreateIndex
CREATE UNIQUE INDEX "coach_replica_usage_coachID_date_key" ON "public"."coach_replica_usage"("coachID", "date");

-- AddForeignKey
ALTER TABLE "public"."coach_ai_configs" ADD CONSTRAINT "coach_ai_configs_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coach_knowledge_files" ADD CONSTRAINT "coach_knowledge_files_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coach_replica_threads" ADD CONSTRAINT "coach_replica_threads_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coach_replica_messages" ADD CONSTRAINT "coach_replica_messages_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coach_replica_usage" ADD CONSTRAINT "coach_replica_usage_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
