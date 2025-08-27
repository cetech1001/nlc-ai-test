-- CreateEnum
CREATE TYPE "public"."CommunityPricingType" AS ENUM ('free', 'monthly', 'annual', 'one_time');

-- AlterTable
ALTER TABLE "public"."communities" ADD COLUMN     "isSystemCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pricingAmount" INTEGER,
ADD COLUMN     "pricingCurrency" VARCHAR(3) DEFAULT 'USD',
ADD COLUMN     "pricingType" "public"."CommunityPricingType" NOT NULL DEFAULT 'free';

-- CreateIndex
CREATE INDEX "communities_pricingType_idx" ON "public"."communities"("pricingType");

-- CreateIndex
CREATE INDEX "communities_isSystemCreated_idx" ON "public"."communities"("isSystemCreated");
