/*
  Warnings:

  - You are about to drop the column `coachID` on the `email_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `integrations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userID,userType,emailAddress]` on the table `email_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userID` to the `email_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `email_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `integrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `integrations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."email_accounts" DROP CONSTRAINT "email_accounts_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."integrations" DROP CONSTRAINT "integrations_coachID_fkey";

-- DropIndex
DROP INDEX "public"."email_accounts_coachID_emailAddress_key";

-- DropIndex
DROP INDEX "public"."idx_integrations_coach_id";

-- AlterTable
ALTER TABLE "public"."email_accounts" DROP COLUMN "coachID",
ADD COLUMN     "userID" UUID NOT NULL,
ADD COLUMN     "userType" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "public"."integrations" DROP COLUMN "coachID",
ADD COLUMN     "userID" UUID NOT NULL,
ADD COLUMN     "userType" VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_email_accounts_user" ON "public"."email_accounts"("userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "email_accounts_userID_userType_emailAddress_key" ON "public"."email_accounts"("userID", "userType", "emailAddress");

-- CreateIndex
CREATE INDEX "idx_integrations_user" ON "public"."integrations"("userID", "userType");

-- CreateIndex
CREATE INDEX "idx_integrations_platform" ON "public"."integrations"("platformName");
