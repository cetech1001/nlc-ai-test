/*
  Warnings:

  - You are about to drop the column `totalRequests` on the `ai_agents` table. All the data in the column will be lost.
  - You are about to drop the column `totalTokensUsed` on the `ai_agents` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `client_coaches` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `clients` table. All the data in the column will be lost.
  - The `status` column on the `community_invites` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `coachID` on the `content_categories` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `deliverability_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `generated_email_responses` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `generated_email_responses` table. All the data in the column will be lost.
  - You are about to drop the column `interactionID` on the `generated_email_responses` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `generated_email_responses` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `generated_email_responses` table. All the data in the column will be lost.
  - You are about to drop the `agent_conversation_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `agent_conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `agent_memories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_interactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coach_ai_configs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coach_connections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coach_onboarding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coach_replica_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coach_replica_threads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coach_replica_usage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coach_scenario_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversation_artifacts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `content_categories` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `ai_agents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `isActive` on table `ai_agents` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."CommunityInviteStatus" AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- DropForeignKey
ALTER TABLE "public"."agent_conversation_messages" DROP CONSTRAINT "agent_conversation_messages_conversationID_fkey";

-- DropForeignKey
ALTER TABLE "public"."agent_conversations" DROP CONSTRAINT "agent_conversations_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."agent_memories" DROP CONSTRAINT "agent_memories_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."ai_interactions" DROP CONSTRAINT "ai_interactions_agentID_fkey";

-- DropForeignKey
ALTER TABLE "public"."ai_interactions" DROP CONSTRAINT "ai_interactions_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."ai_interactions" DROP CONSTRAINT "ai_interactions_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."coach_ai_configs" DROP CONSTRAINT "coach_ai_configs_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."coach_connections" DROP CONSTRAINT "coach_connections_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."coach_onboarding" DROP CONSTRAINT "coach_onboarding_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."coach_replica_messages" DROP CONSTRAINT "coach_replica_messages_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."coach_replica_threads" DROP CONSTRAINT "coach_replica_threads_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."coach_replica_usage" DROP CONSTRAINT "coach_replica_usage_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."coach_scenario_answers" DROP CONSTRAINT "coach_scenario_answers_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_categories" DROP CONSTRAINT "content_categories_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_artifacts" DROP CONSTRAINT "conversation_artifacts_conversationID_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_artifacts" DROP CONSTRAINT "conversation_artifacts_messageID_fkey";

-- DropForeignKey
ALTER TABLE "public"."deliverability_analyses" DROP CONSTRAINT "deliverability_analyses_coachId_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_coachId_fkey";

-- DropForeignKey
ALTER TABLE "public"."generated_email_responses" DROP CONSTRAINT "generated_email_responses_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."generated_email_responses" DROP CONSTRAINT "generated_email_responses_coachId_fkey";

-- DropForeignKey
ALTER TABLE "public"."generated_email_responses" DROP CONSTRAINT "generated_email_responses_interactionID_fkey";

-- DropIndex
DROP INDEX "public"."content_categories_coachID_idx";

-- DropIndex
DROP INDEX "public"."content_categories_name_coachID_key";

-- DropIndex
DROP INDEX "public"."generated_email_responses_userID_userType_idx";

-- AlterTable
ALTER TABLE "public"."ai_agents" DROP COLUMN "totalRequests",
DROP COLUMN "totalTokensUsed",
DROP COLUMN "type",
ADD COLUMN     "type" "public"."AgentType" NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."client_coaches" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "customFields",
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "timezone" VARCHAR(50) DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "public"."coaches" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "public"."community_invites" DROP COLUMN "status",
ADD COLUMN     "status" "public"."CommunityInviteStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "public"."content_categories" DROP COLUMN "coachID";

-- AlterTable
ALTER TABLE "public"."deliverability_analyses" DROP COLUMN "coachId";

-- AlterTable
ALTER TABLE "public"."email_messages" DROP COLUMN "clientId",
DROP COLUMN "coachId",
ADD COLUMN     "clientID" UUID,
ADD COLUMN     "coachID" UUID,
ADD COLUMN     "leadID" UUID;

-- AlterTable
ALTER TABLE "public"."generated_email_responses" DROP COLUMN "clientId",
DROP COLUMN "coachId",
DROP COLUMN "interactionID",
DROP COLUMN "userID",
DROP COLUMN "userType";

-- DropTable
DROP TABLE "public"."agent_conversation_messages";

-- DropTable
DROP TABLE "public"."agent_conversations";

-- DropTable
DROP TABLE "public"."agent_memories";

-- DropTable
DROP TABLE "public"."ai_interactions";

-- DropTable
DROP TABLE "public"."coach_ai_configs";

-- DropTable
DROP TABLE "public"."coach_connections";

-- DropTable
DROP TABLE "public"."coach_onboarding";

-- DropTable
DROP TABLE "public"."coach_replica_messages";

-- DropTable
DROP TABLE "public"."coach_replica_threads";

-- DropTable
DROP TABLE "public"."coach_replica_usage";

-- DropTable
DROP TABLE "public"."coach_scenario_answers";

-- DropTable
DROP TABLE "public"."conversation_artifacts";

-- CreateTable
CREATE TABLE "public"."AgentThread" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "agentID" UUID NOT NULL,
    "openaiThreadID" VARCHAR(255),
    "title" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMPTZ(6),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AgentThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentMessage" (
    "id" UUID NOT NULL,
    "threadID" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "messageID" VARCHAR(255),
    "runID" VARCHAR(255),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentThread_coachID_agentID_idx" ON "public"."AgentThread"("coachID", "agentID");

-- CreateIndex
CREATE INDEX "AgentMessage_threadID_idx" ON "public"."AgentMessage"("threadID");

-- CreateIndex
CREATE INDEX "community_invites_status_idx" ON "public"."community_invites"("status");

-- CreateIndex
CREATE UNIQUE INDEX "content_categories_name_key" ON "public"."content_categories"("name");

-- AddForeignKey
ALTER TABLE "public"."AgentThread" ADD CONSTRAINT "AgentThread_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentMessage" ADD CONSTRAINT "AgentMessage_threadID_fkey" FOREIGN KEY ("threadID") REFERENCES "public"."AgentThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentMessage" ADD CONSTRAINT "AgentMessage_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_leadID_fkey" FOREIGN KEY ("leadID") REFERENCES "public"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
