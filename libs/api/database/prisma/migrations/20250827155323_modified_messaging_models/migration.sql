/*
  Warnings:

  - You are about to drop the `direct_messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."direct_messages" DROP CONSTRAINT "direct_messages_conversationID_fkey";

-- DropForeignKey
ALTER TABLE "public"."direct_messages" DROP CONSTRAINT "direct_messages_replyToMessageID_fkey";

-- AlterTable
ALTER TABLE "public"."conversations" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "public"."direct_messages";

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" UUID NOT NULL,
    "conversationID" UUID NOT NULL,
    "senderID" UUID NOT NULL,
    "senderType" VARCHAR(20) NOT NULL,
    "senderName" VARCHAR(255) NOT NULL,
    "senderAvatarUrl" TEXT,
    "type" "public"."MessageType" NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fileUrl" TEXT,
    "fileName" VARCHAR(255),
    "fileSize" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ(6),
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMPTZ(6),
    "replyToMessageID" UUID,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_deliveries" (
    "id" UUID NOT NULL,
    "messageID" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "userType" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_participants" (
    "id" UUID NOT NULL,
    "conversationID" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "userType" VARCHAR(20) NOT NULL,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" VARCHAR(20) NOT NULL DEFAULT 'member',

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_conversationID_idx" ON "public"."messages"("conversationID");

-- CreateIndex
CREATE INDEX "messages_senderID_senderType_idx" ON "public"."messages"("senderID", "senderType");

-- CreateIndex
CREATE INDEX "messages_senderName_idx" ON "public"."messages"("senderName");

-- CreateIndex
CREATE INDEX "messages_isRead_idx" ON "public"."messages"("isRead");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "public"."messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_replyToMessageID_idx" ON "public"."messages"("replyToMessageID");

-- CreateIndex
CREATE INDEX "message_deliveries_userID_userType_idx" ON "public"."message_deliveries"("userID", "userType");

-- CreateIndex
CREATE INDEX "message_deliveries_status_idx" ON "public"."message_deliveries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "message_deliveries_messageID_userID_userType_key" ON "public"."message_deliveries"("messageID", "userID", "userType");

-- CreateIndex
CREATE INDEX "conversation_participants_userID_userType_idx" ON "public"."conversation_participants"("userID", "userType");

-- CreateIndex
CREATE INDEX "conversation_participants_conversationID_idx" ON "public"."conversation_participants"("conversationID");

-- CreateIndex
CREATE INDEX "conversation_participants_isActive_idx" ON "public"."conversation_participants"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationID_userID_userType_key" ON "public"."conversation_participants"("conversationID", "userID", "userType");

-- CreateIndex
CREATE INDEX "conversations_isActive_idx" ON "public"."conversations"("isActive");

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversationID_fkey" FOREIGN KEY ("conversationID") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_replyToMessageID_fkey" FOREIGN KEY ("replyToMessageID") REFERENCES "public"."messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
