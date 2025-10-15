-- CreateTable
CREATE TABLE "public"."video_idea_runs" (
    "id" TEXT NOT NULL,
    "coachID" UUID NOT NULL,
    "threadID" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceReference" TEXT,
    "transcriptText" TEXT,
    "desiredVibes" TEXT[],
    "extraContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_idea_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."video_script_variants" (
    "id" TEXT NOT NULL,
    "runID" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "vibe" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "main" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "hookRegenCount" INTEGER NOT NULL DEFAULT 0,
    "mainRegenCount" INTEGER NOT NULL DEFAULT 0,
    "ctaRegenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_script_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_idea_runs_coachID_createdAt_idx" ON "public"."video_idea_runs"("coachID", "createdAt");

-- CreateIndex
CREATE INDEX "video_script_variants_runID_index_idx" ON "public"."video_script_variants"("runID", "index");

-- CreateIndex
CREATE UNIQUE INDEX "video_script_variants_runID_index_key" ON "public"."video_script_variants"("runID", "index");

-- AddForeignKey
ALTER TABLE "public"."video_idea_runs" ADD CONSTRAINT "video_idea_runs_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_script_variants" ADD CONSTRAINT "video_script_variants_runID_fkey" FOREIGN KEY ("runID") REFERENCES "public"."video_idea_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
