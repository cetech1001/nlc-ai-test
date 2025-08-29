-- CreateEnum
CREATE TYPE "public"."ModerationStatus" AS ENUM ('pending', 'approved', 'removed', 'dismissed');

-- CreateEnum
CREATE TYPE "public"."ModerationPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "public"."ViolationType" AS ENUM ('spam', 'harassment', 'inappropriate', 'hate_speech', 'misinformation', 'copyright');

-- CreateEnum
CREATE TYPE "public"."ModerationActionType" AS ENUM ('content_approved', 'content_removed', 'content_dismissed', 'member_warned', 'member_suspended', 'member_banned', 'auto_flagged', 'user_reported');

-- AlterTable
ALTER TABLE "public"."communities" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."posts" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."flagged_content" (
    "id" UUID NOT NULL,
    "contentID" UUID NOT NULL,
    "contentType" VARCHAR(20) NOT NULL,
    "communityID" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "authorID" UUID NOT NULL,
    "authorName" VARCHAR(255) NOT NULL,
    "authorType" VARCHAR(20) NOT NULL,
    "status" "public"."ModerationStatus" NOT NULL DEFAULT 'pending',
    "priority" "public"."ModerationPriority" NOT NULL DEFAULT 'medium',
    "flagCount" INTEGER NOT NULL DEFAULT 1,
    "reasons" "public"."ViolationType"[] DEFAULT ARRAY[]::"public"."ViolationType"[],
    "aiScore" REAL,
    "aiReason" TEXT,
    "reportedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMPTZ(6),
    "resolvedBy" UUID,
    "resolvedByType" VARCHAR(20),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "flagged_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_reports" (
    "id" UUID NOT NULL,
    "flaggedContentID" UUID NOT NULL,
    "communityID" UUID NOT NULL,
    "reporterID" UUID NOT NULL,
    "reporterType" VARCHAR(20) NOT NULL,
    "reporterName" VARCHAR(255) NOT NULL,
    "reason" "public"."ViolationType" NOT NULL,
    "details" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moderation_actions" (
    "id" UUID NOT NULL,
    "communityID" UUID NOT NULL,
    "flaggedContentID" UUID,
    "type" "public"."ModerationActionType" NOT NULL,
    "targetType" VARCHAR(20) NOT NULL,
    "targetID" UUID NOT NULL,
    "targetUser" UUID NOT NULL,
    "targetUserType" VARCHAR(20) NOT NULL,
    "targetInfo" JSONB DEFAULT '{}',
    "moderatorID" UUID NOT NULL,
    "moderatorName" VARCHAR(255) NOT NULL,
    "moderatorType" VARCHAR(20) NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moderation_rules" (
    "id" UUID NOT NULL,
    "communityID" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "actions" JSONB NOT NULL DEFAULT '{}',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "lastTriggered" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "moderation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moderation_stats" (
    "id" UUID NOT NULL,
    "communityID" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "flaggedPosts" INTEGER NOT NULL DEFAULT 0,
    "flaggedComments" INTEGER NOT NULL DEFAULT 0,
    "contentApproved" INTEGER NOT NULL DEFAULT 0,
    "contentRemoved" INTEGER NOT NULL DEFAULT 0,
    "contentDismissed" INTEGER NOT NULL DEFAULT 0,
    "membersWarned" INTEGER NOT NULL DEFAULT 0,
    "membersSuspended" INTEGER NOT NULL DEFAULT 0,
    "membersBanned" INTEGER NOT NULL DEFAULT 0,
    "aiScanned" INTEGER NOT NULL DEFAULT 0,
    "aiAutoResolved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flagged_content_communityID_idx" ON "public"."flagged_content"("communityID");

-- CreateIndex
CREATE INDEX "flagged_content_status_idx" ON "public"."flagged_content"("status");

-- CreateIndex
CREATE INDEX "flagged_content_priority_idx" ON "public"."flagged_content"("priority");

-- CreateIndex
CREATE INDEX "flagged_content_contentType_idx" ON "public"."flagged_content"("contentType");

-- CreateIndex
CREATE INDEX "flagged_content_authorID_authorType_idx" ON "public"."flagged_content"("authorID", "authorType");

-- CreateIndex
CREATE INDEX "flagged_content_reportedAt_idx" ON "public"."flagged_content"("reportedAt");

-- CreateIndex
CREATE INDEX "content_reports_flaggedContentID_idx" ON "public"."content_reports"("flaggedContentID");

-- CreateIndex
CREATE INDEX "content_reports_communityID_idx" ON "public"."content_reports"("communityID");

-- CreateIndex
CREATE INDEX "content_reports_reporterID_reporterType_idx" ON "public"."content_reports"("reporterID", "reporterType");

-- CreateIndex
CREATE INDEX "content_reports_reason_idx" ON "public"."content_reports"("reason");

-- CreateIndex
CREATE INDEX "moderation_actions_communityID_idx" ON "public"."moderation_actions"("communityID");

-- CreateIndex
CREATE INDEX "moderation_actions_type_idx" ON "public"."moderation_actions"("type");

-- CreateIndex
CREATE INDEX "moderation_actions_targetType_idx" ON "public"."moderation_actions"("targetType");

-- CreateIndex
CREATE INDEX "moderation_actions_targetID_idx" ON "public"."moderation_actions"("targetID");

-- CreateIndex
CREATE INDEX "moderation_actions_moderatorID_moderatorType_idx" ON "public"."moderation_actions"("moderatorID", "moderatorType");

-- CreateIndex
CREATE INDEX "moderation_actions_createdAt_idx" ON "public"."moderation_actions"("createdAt");

-- CreateIndex
CREATE INDEX "moderation_rules_communityID_idx" ON "public"."moderation_rules"("communityID");

-- CreateIndex
CREATE INDEX "moderation_rules_isEnabled_idx" ON "public"."moderation_rules"("isEnabled");

-- CreateIndex
CREATE INDEX "moderation_rules_type_idx" ON "public"."moderation_rules"("type");

-- CreateIndex
CREATE INDEX "moderation_stats_date_idx" ON "public"."moderation_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_stats_communityID_date_key" ON "public"."moderation_stats"("communityID", "date");

-- AddForeignKey
ALTER TABLE "public"."flagged_content" ADD CONSTRAINT "flagged_content_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_reports" ADD CONSTRAINT "content_reports_flaggedContentID_fkey" FOREIGN KEY ("flaggedContentID") REFERENCES "public"."flagged_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_reports" ADD CONSTRAINT "content_reports_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderation_actions" ADD CONSTRAINT "moderation_actions_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderation_actions" ADD CONSTRAINT "moderation_actions_flaggedContentID_fkey" FOREIGN KEY ("flaggedContentID") REFERENCES "public"."flagged_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderation_rules" ADD CONSTRAINT "moderation_rules_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderation_stats" ADD CONSTRAINT "moderation_stats_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
