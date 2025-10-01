-- CreateTable
CREATE TABLE "public"."coach_follows" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "followerID" UUID NOT NULL,
    "followerType" "public"."UserType" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_follows_coachID_idx" ON "public"."coach_follows"("coachID");

-- CreateIndex
CREATE INDEX "coach_follows_followerID_followerType_idx" ON "public"."coach_follows"("followerID", "followerType");

-- CreateIndex
CREATE UNIQUE INDEX "coach_follows_coachID_followerID_followerType_key" ON "public"."coach_follows"("coachID", "followerID", "followerType");

-- AddForeignKey
ALTER TABLE "public"."coach_follows" ADD CONSTRAINT "coach_follows_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
