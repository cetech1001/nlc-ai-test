-- AlterTable
ALTER TABLE "public"."coach_knowledge_files" ADD COLUMN     "category" VARCHAR(50);

-- CreateTable
CREATE TABLE "public"."coach_scenario_answers" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "questionID" VARCHAR(100) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "coach_scenario_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coach_connections" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "connectionID" VARCHAR(50) NOT NULL,
    "connectionName" VARCHAR(100) NOT NULL,
    "connectionType" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "connectedAt" TIMESTAMPTZ(6),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "coach_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coach_onboarding" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "completedAt" TIMESTAMPTZ(6),
    "scenariosCompleted" INTEGER NOT NULL DEFAULT 0,
    "documentsUploaded" INTEGER NOT NULL DEFAULT 0,
    "connectionsLinked" INTEGER NOT NULL DEFAULT 0,
    "completionScore" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "coach_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_scenario_answers_coachID_idx" ON "public"."coach_scenario_answers"("coachID");

-- CreateIndex
CREATE INDEX "coach_scenario_answers_category_idx" ON "public"."coach_scenario_answers"("category");

-- CreateIndex
CREATE UNIQUE INDEX "coach_scenario_answers_coachID_questionID_key" ON "public"."coach_scenario_answers"("coachID", "questionID");

-- CreateIndex
CREATE INDEX "coach_connections_coachID_idx" ON "public"."coach_connections"("coachID");

-- CreateIndex
CREATE INDEX "coach_connections_status_idx" ON "public"."coach_connections"("status");

-- CreateIndex
CREATE INDEX "coach_connections_connectionType_idx" ON "public"."coach_connections"("connectionType");

-- CreateIndex
CREATE UNIQUE INDEX "coach_connections_coachID_connectionID_key" ON "public"."coach_connections"("coachID", "connectionID");

-- CreateIndex
CREATE UNIQUE INDEX "coach_onboarding_coachID_key" ON "public"."coach_onboarding"("coachID");

-- CreateIndex
CREATE INDEX "coach_onboarding_coachID_idx" ON "public"."coach_onboarding"("coachID");

-- CreateIndex
CREATE INDEX "coach_onboarding_completedAt_idx" ON "public"."coach_onboarding"("completedAt");

-- CreateIndex
CREATE INDEX "coach_knowledge_files_category_idx" ON "public"."coach_knowledge_files"("category");

-- AddForeignKey
ALTER TABLE "public"."coach_scenario_answers" ADD CONSTRAINT "coach_scenario_answers_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coach_connections" ADD CONSTRAINT "coach_connections_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coach_onboarding" ADD CONSTRAINT "coach_onboarding_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
