-- AlterTable
ALTER TABLE "public"."email_threads" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."scheduled_emails" ADD COLUMN     "threadID" UUID;

-- CreateTable
CREATE TABLE "public"."generated_email_responses" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "threadID" UUID NOT NULL,
    "clientID" UUID NOT NULL,
    "interactionID" UUID,
    "subject" VARCHAR(500) NOT NULL,
    "body" TEXT NOT NULL,
    "actualSubject" VARCHAR(500),
    "actualBody" TEXT,
    "confidence" DECIMAL(3,2) DEFAULT 0.8,
    "deliverabilityScore" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'generated',
    "sentAt" TIMESTAMPTZ(6),
    "scheduledFor" TIMESTAMPTZ(6),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "generated_email_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deliverability_analyses" (
    "id" UUID NOT NULL,
    "coachID" UUID,
    "subject" VARCHAR(500) NOT NULL,
    "body" TEXT NOT NULL,
    "recipientType" VARCHAR(20) NOT NULL DEFAULT 'general',
    "overallScore" INTEGER,
    "primaryInboxProbability" INTEGER,
    "spamTriggers" JSONB DEFAULT '[]',
    "recommendations" JSONB DEFAULT '[]',
    "improvements" JSONB DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'processing',
    "completedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverability_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generated_email_responses_coachID_status_idx" ON "public"."generated_email_responses"("coachID", "status");

-- CreateIndex
CREATE INDEX "generated_email_responses_threadID_idx" ON "public"."generated_email_responses"("threadID");

-- CreateIndex
CREATE INDEX "generated_email_responses_createdAt_idx" ON "public"."generated_email_responses"("createdAt");

-- CreateIndex
CREATE INDEX "deliverability_analyses_coachID_idx" ON "public"."deliverability_analyses"("coachID");

-- CreateIndex
CREATE INDEX "deliverability_analyses_createdAt_idx" ON "public"."deliverability_analyses"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."generated_email_responses" ADD CONSTRAINT "generated_email_responses_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_email_responses" ADD CONSTRAINT "generated_email_responses_threadID_fkey" FOREIGN KEY ("threadID") REFERENCES "public"."email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_email_responses" ADD CONSTRAINT "generated_email_responses_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_email_responses" ADD CONSTRAINT "generated_email_responses_interactionID_fkey" FOREIGN KEY ("interactionID") REFERENCES "public"."ai_interactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deliverability_analyses" ADD CONSTRAINT "deliverability_analyses_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
