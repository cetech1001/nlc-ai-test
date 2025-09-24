-- CreateEnum
CREATE TYPE "public"."AgentType" AS ENUM ('content_creation', 'email_response', 'lead_followup', 'client_retention', 'coach_replica');

-- CreateTable
CREATE TABLE "public"."agent_conversations" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "agentType" "public"."AgentType" NOT NULL,
    "title" VARCHAR(255),
    "contextSummary" TEXT,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "agent_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_conversation_messages" (
    "id" UUID NOT NULL,
    "conversationID" UUID NOT NULL,
    "senderType" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" VARCHAR(20) NOT NULL DEFAULT 'text',
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_artifacts" (
    "id" UUID NOT NULL,
    "conversationID" UUID NOT NULL,
    "messageID" UUID,
    "artifactType" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conversation_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_memories" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "agentType" VARCHAR(50) NOT NULL,
    "memoryType" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "importanceScore" DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    "lastAccessed" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_memories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_conversations_coachID_agentType_idx" ON "public"."agent_conversations"("coachID", "agentType");

-- CreateIndex
CREATE INDEX "agent_conversations_isActive_idx" ON "public"."agent_conversations"("isActive");

-- CreateIndex
CREATE INDEX "agent_conversation_messages_conversationID_idx" ON "public"."agent_conversation_messages"("conversationID");

-- CreateIndex
CREATE INDEX "agent_conversation_messages_createdAt_idx" ON "public"."agent_conversation_messages"("createdAt");

-- CreateIndex
CREATE INDEX "conversation_artifacts_conversationID_idx" ON "public"."conversation_artifacts"("conversationID");

-- CreateIndex
CREATE INDEX "conversation_artifacts_artifactType_idx" ON "public"."conversation_artifacts"("artifactType");

-- CreateIndex
CREATE INDEX "agent_memories_coachID_agentType_idx" ON "public"."agent_memories"("coachID", "agentType");

-- CreateIndex
CREATE INDEX "agent_memories_memoryType_idx" ON "public"."agent_memories"("memoryType");

-- AddForeignKey
ALTER TABLE "public"."agent_conversations" ADD CONSTRAINT "agent_conversations_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agent_conversation_messages" ADD CONSTRAINT "agent_conversation_messages_conversationID_fkey" FOREIGN KEY ("conversationID") REFERENCES "public"."agent_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_artifacts" ADD CONSTRAINT "conversation_artifacts_conversationID_fkey" FOREIGN KEY ("conversationID") REFERENCES "public"."agent_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_artifacts" ADD CONSTRAINT "conversation_artifacts_messageID_fkey" FOREIGN KEY ("messageID") REFERENCES "public"."agent_conversation_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agent_memories" ADD CONSTRAINT "agent_memories_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
