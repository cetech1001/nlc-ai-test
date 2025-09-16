/*
  Warnings:

  - The `userType` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userType` on the `activity_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userType` on the `community_members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userType` on the `conversation_participants` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userType` on the `email_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userID` to the `email_sequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `email_sequences` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `userType` on the `email_templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userType` on the `email_threads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userType` on the `integrations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userType` on the `message_deliveries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userType` on the `notification_preferences` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userType` on the `post_reactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('admin', 'coach', 'client');

-- AlterTable
ALTER TABLE "public"."activity_logs" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."community_members" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."conversation_participants" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_accounts" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_sequences" ADD COLUMN     "userID" VARCHAR(50) NOT NULL,
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_templates" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_threads" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."integrations" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."message_deliveries" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."notification_preferences" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."notifications" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType";

-- AlterTable
ALTER TABLE "public"."post_reactions" DROP COLUMN "userType",
ADD COLUMN     "userType" "public"."UserType" NOT NULL;

-- CreateIndex
CREATE INDEX "activity_logs_userID_userType_idx" ON "public"."activity_logs"("userID", "userType");

-- CreateIndex
CREATE INDEX "community_members_userID_userType_idx" ON "public"."community_members"("userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_communityID_userID_userType_key" ON "public"."community_members"("communityID", "userID", "userType");

-- CreateIndex
CREATE INDEX "conversation_participants_userID_userType_idx" ON "public"."conversation_participants"("userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationID_userID_userType_key" ON "public"."conversation_participants"("conversationID", "userID", "userType");

-- CreateIndex
CREATE INDEX "idx_email_accounts_user" ON "public"."email_accounts"("userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "email_accounts_userID_userType_emailAddress_key" ON "public"."email_accounts"("userID", "userType", "emailAddress");

-- CreateIndex
CREATE INDEX "idx_integrations_user" ON "public"."integrations"("userID", "userType");

-- CreateIndex
CREATE INDEX "message_deliveries_userID_userType_idx" ON "public"."message_deliveries"("userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "message_deliveries_messageID_userID_userType_key" ON "public"."message_deliveries"("messageID", "userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userID_userType_key" ON "public"."notification_preferences"("userID", "userType");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "public"."notifications"("userID", "userType");

-- CreateIndex
CREATE INDEX "post_reactions_userID_userType_idx" ON "public"."post_reactions"("userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_postID_userID_userType_key" ON "public"."post_reactions"("postID", "userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_commentID_userID_userType_key" ON "public"."post_reactions"("commentID", "userID", "userType");
