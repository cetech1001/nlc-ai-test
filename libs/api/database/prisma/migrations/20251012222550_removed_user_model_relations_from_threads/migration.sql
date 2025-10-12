/*
  Warnings:

  - You are about to drop the column `clientID` on the `email_threads` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `email_threads` table. All the data in the column will be lost.
  - You are about to drop the column `leadID` on the `email_threads` table. All the data in the column will be lost.
  - The `participantType` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `provider` on the `email_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."EmailAccountProviders" AS ENUM ('gmail', 'outlook');

-- CreateEnum
CREATE TYPE "public"."EmailThreadParticipantType" AS ENUM ('coach', 'client', 'lead');

-- DropForeignKey
ALTER TABLE "public"."email_threads" DROP CONSTRAINT "email_threads_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_threads" DROP CONSTRAINT "email_threads_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."email_threads" DROP CONSTRAINT "email_threads_leadID_fkey";

-- DropIndex
DROP INDEX "public"."email_threads_clientID_idx";

-- DropIndex
DROP INDEX "public"."email_threads_coachID_idx";

-- DropIndex
DROP INDEX "public"."email_threads_leadID_idx";

-- AlterTable
ALTER TABLE "public"."email_accounts" DROP COLUMN "provider",
ADD COLUMN     "provider" "public"."EmailAccountProviders" NOT NULL;

-- AlterTable
ALTER TABLE "public"."email_threads" DROP COLUMN "clientID",
DROP COLUMN "coachID",
DROP COLUMN "leadID",
ADD COLUMN     "participantID" UUID,
DROP COLUMN "participantType",
ADD COLUMN     "participantType" "public"."EmailThreadParticipantType";

-- DropEnum
DROP TYPE "public"."EmailProviders";
