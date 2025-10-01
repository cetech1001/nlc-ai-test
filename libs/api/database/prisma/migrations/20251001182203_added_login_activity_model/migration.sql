-- CreateTable
CREATE TABLE "public"."login_activities" (
    "id" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "userType" VARCHAR(50) NOT NULL,
    "loginAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "deviceType" VARCHAR(50),
    "platform" VARCHAR(50),
    "browser" VARCHAR(50),
    "loginMethod" VARCHAR(50),
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failureReason" VARCHAR(255),

    CONSTRAINT "login_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_login_activity_user_id" ON "public"."login_activities"("userID");

-- CreateIndex
CREATE INDEX "idx_login_activity_user_id_login_at" ON "public"."login_activities"("userID", "loginAt");

-- CreateIndex
CREATE INDEX "idx_login_activity_login_at" ON "public"."login_activities"("loginAt");

-- CreateIndex
CREATE INDEX "idx_login_activity_user_type" ON "public"."login_activities"("userType");
