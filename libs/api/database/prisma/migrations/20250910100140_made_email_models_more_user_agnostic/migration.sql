/*
  Warnings:

  - The `provider` column on the `clients` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `provider` column on the `coaches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `threadID` on the `email_messages` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `email_templates` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `email_threads` table. All the data in the column will be lost.
  - Added the required column `emailThreadID` to the `email_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientType` to the `email_threads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `email_threads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `email_threads` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AuthProviders" AS ENUM ('google');

-- CreateEnum
CREATE TYPE "public"."TemplateCategory" AS ENUM ('auth', 'client_response', 'lead_followup', 'billing', 'system');

-- DropForeignKey
ALTER TABLE "public"."email_messages" DROP CONSTRAINT "email_messages_threadID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_templates" DROP CONSTRAINT "email_templates_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_threads" DROP CONSTRAINT "email_threads_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_threads" DROP CONSTRAINT "email_threads_coachID_fkey";

-- DropIndex
DROP INDEX "public"."idx_email_messages_thread_id";

-- DropIndex
DROP INDEX "public"."idx_email_threads_client_id";

-- DropIndex
DROP INDEX "public"."idx_email_threads_coach_id";

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "provider",
ADD COLUMN     "provider" "public"."AuthProviders";

-- AlterTable
ALTER TABLE "public"."coaches" DROP COLUMN "provider",
ADD COLUMN     "provider" "public"."AuthProviders";

-- AlterTable
ALTER TABLE "public"."email_messages" DROP COLUMN "threadID",
ADD COLUMN     "emailThreadID" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_templates" DROP COLUMN "coachID",
ADD COLUMN     "userID" UUID NOT NULL,
ADD COLUMN     "userType" VARCHAR(20) NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "public"."TemplateCategory" NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_threads" DROP COLUMN "coachID",
ADD COLUMN     "clientType" VARCHAR(20) NOT NULL,
ADD COLUMN     "userID" UUID NOT NULL,
ADD COLUMN     "userType" VARCHAR(20) NOT NULL;

-- DropEnum
DROP TYPE "public"."Providers";

-- CreateIndex
CREATE INDEX "idx_email_messages_thread_id" ON "public"."email_messages"("emailThreadID");

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_emailThreadID_fkey" FOREIGN KEY ("emailThreadID") REFERENCES "public"."email_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
