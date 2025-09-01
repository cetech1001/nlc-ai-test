-- AlterTable
ALTER TABLE "public"."payment_methods" ADD COLUMN     "clientID" UUID,
ALTER COLUMN "coachID" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."plan_ai_agents" (
    "id" UUID NOT NULL,
    "planID" UUID NOT NULL,
    "agentID" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "plan_ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_ai_agents_planID_idx" ON "public"."plan_ai_agents"("planID");

-- CreateIndex
CREATE INDEX "plan_ai_agents_agentID_idx" ON "public"."plan_ai_agents"("agentID");

-- CreateIndex
CREATE UNIQUE INDEX "plan_ai_agents_planID_agentID_key" ON "public"."plan_ai_agents"("planID", "agentID");

-- AddForeignKey
ALTER TABLE "public"."payment_methods" ADD CONSTRAINT "payment_methods_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_ai_agents" ADD CONSTRAINT "plan_ai_agents_planID_fkey" FOREIGN KEY ("planID") REFERENCES "public"."plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_ai_agents" ADD CONSTRAINT "plan_ai_agents_agentID_fkey" FOREIGN KEY ("agentID") REFERENCES "public"."ai_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
