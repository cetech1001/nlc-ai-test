/*
  Warnings:

  - You are about to drop the `coach_ai_agents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."coach_ai_agents" DROP CONSTRAINT "coach_ai_agents_agentID_fkey";

-- DropForeignKey
ALTER TABLE "public"."coach_ai_agents" DROP CONSTRAINT "coach_ai_agents_coachID_fkey";

-- DropTable
DROP TABLE "public"."coach_ai_agents";

-- CreateTable
CREATE TABLE "public"."CoachAiAgent" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "agentID" UUID NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "customConfig" JSONB DEFAULT '{}',
    "assistantID" VARCHAR(255),
    "vectorStoreID" VARCHAR(255),
    "assistantName" VARCHAR(255),
    "instructions" TEXT,
    "model" VARCHAR(50) DEFAULT 'gpt-4o',
    "fineTunedModelID" VARCHAR(255),
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "totalTokensUsed" BIGINT NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CoachAiAgent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachAiAgent_coachID_agentID_key" ON "public"."CoachAiAgent"("coachID", "agentID");

-- AddForeignKey
ALTER TABLE "public"."CoachAiAgent" ADD CONSTRAINT "CoachAiAgent_agentID_fkey" FOREIGN KEY ("agentID") REFERENCES "public"."ai_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoachAiAgent" ADD CONSTRAINT "CoachAiAgent_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
