-- AlterTable
ALTER TABLE "public"."ai_agents" ADD COLUMN     "lastUsedAt" TIMESTAMPTZ(6),
ADD COLUMN     "totalRequests" INTEGER DEFAULT 0,
ADD COLUMN     "totalTokensUsed" BIGINT DEFAULT 0;
