/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `ai_agents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "public"."chatbot_customizations" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "avatarUrl" TEXT,
    "logoUrl" TEXT,
    "primaryColor" VARCHAR(7) NOT NULL DEFAULT '#DF69FF',
    "gradientStart" VARCHAR(7) NOT NULL DEFAULT '#B339D4',
    "gradientEnd" VARCHAR(7) NOT NULL DEFAULT '#7B21BA',
    "assistantTextColor" VARCHAR(7) NOT NULL DEFAULT '#C5C5C5',
    "assistantBubbleColor" VARCHAR(7) NOT NULL DEFAULT '#1A1A1A',
    "userTextColor" VARCHAR(7) NOT NULL DEFAULT '#C5C5C5',
    "userBubbleColor" VARCHAR(30) NOT NULL DEFAULT 'rgba(223,105,255,0.08)',
    "backgroundColor" VARCHAR(7) NOT NULL DEFAULT '#0A0A0A',
    "glowColor" VARCHAR(7) NOT NULL DEFAULT '#7B21BA',
    "position" VARCHAR(20) NOT NULL DEFAULT 'bottom-right',
    "greeting" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chatbot_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_customizations_coachID_key" ON "public"."chatbot_customizations"("coachID");

-- CreateIndex
CREATE UNIQUE INDEX "ai_agents_type_key" ON "public"."ai_agents"("type");

-- AddForeignKey
ALTER TABLE "public"."chatbot_customizations" ADD CONSTRAINT "chatbot_customizations_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
