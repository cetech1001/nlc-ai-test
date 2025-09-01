/*
  Warnings:

  - You are about to drop the column `pricingAmount` on the `communities` table. All the data in the column will be lost.
  - You are about to drop the column `pricingCurrency` on the `communities` table. All the data in the column will be lost.
  - You are about to drop the column `currentModule` on the `course_enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `daysSinceLastLogin` on the `course_enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `enrolledByCoachID` on the `course_enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `modulesCompleted` on the `course_enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedActions` on the `course_enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `platformCourseID` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `platformUrl` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `totalModules` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `transactionID` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `payment_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentType` to the `course_enrollments` table without a default value. This is not possible if the table is not empty.
  - Made the column `enrolledAt` on table `course_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `progressPercentage` on table `course_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalTimeSpentMinutes` on table `course_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `loginCount` on table `course_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `course_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dropoutRiskScore` on table `course_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `course_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `course_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `customerID` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerType` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payerID` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payerType` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PricingType" AS ENUM ('one_time', 'recurring', 'installment');

-- CreateEnum
CREATE TYPE "public"."PaymentRequestStatus" AS ENUM ('pending', 'paid', 'expired', 'canceled');

-- CreateEnum
CREATE TYPE "public"."PaymentRequestType" AS ENUM ('plan_payment', 'course_payment', 'community_payment', 'custom_payment');

-- DropForeignKey
ALTER TABLE "public"."course_enrollments" DROP CONSTRAINT "course_enrollments_clientID_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_enrollments" DROP CONSTRAINT "course_enrollments_courseID_fkey";

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."invoices" DROP CONSTRAINT "invoices_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."invoices" DROP CONSTRAINT "invoices_subscriptionID_fkey";

-- DropForeignKey
ALTER TABLE "public"."invoices" DROP CONSTRAINT "invoices_transactionID_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment_links" DROP CONSTRAINT "payment_links_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment_links" DROP CONSTRAINT "payment_links_planID_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscription" DROP CONSTRAINT "subscription_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscription" DROP CONSTRAINT "subscription_planID_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_subscriptionID_fkey";

-- AlterTable
ALTER TABLE "public"."communities" DROP COLUMN "pricingAmount",
DROP COLUMN "pricingCurrency",
ADD COLUMN     "annualPrice" INTEGER,
ADD COLUMN     "currency" VARCHAR(3) DEFAULT 'USD',
ADD COLUMN     "monthlyPrice" INTEGER,
ADD COLUMN     "oneTimePrice" INTEGER;

-- AlterTable
ALTER TABLE "public"."course_enrollments" DROP COLUMN "currentModule",
DROP COLUMN "daysSinceLastLogin",
DROP COLUMN "enrolledByCoachID",
DROP COLUMN "modulesCompleted",
DROP COLUMN "recommendedActions",
ADD COLUMN     "chaptersCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentChapterID" UUID,
ADD COLUMN     "currentLessonID" UUID,
ADD COLUMN     "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextPaymentDue" TIMESTAMP(3),
ADD COLUMN     "paymentType" "public"."PricingType" NOT NULL,
ADD COLUMN     "remainingBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPaid" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "enrolledAt" SET NOT NULL,
ALTER COLUMN "progressPercentage" SET NOT NULL,
ALTER COLUMN "totalTimeSpentMinutes" SET NOT NULL,
ALTER COLUMN "loginCount" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "dropoutRiskScore" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "platform",
DROP COLUMN "platformCourseID",
DROP COLUMN "platformUrl",
DROP COLUMN "totalModules",
ADD COLUMN     "allowInstallments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowSubscriptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "annualPrice" INTEGER,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "dripCount" INTEGER,
ADD COLUMN     "dripInterval" VARCHAR(20),
ADD COLUMN     "installmentAmount" INTEGER,
ADD COLUMN     "installmentCount" INTEGER,
ADD COLUMN     "installmentInterval" VARCHAR(20),
ADD COLUMN     "isDripEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "monthlyPrice" INTEGER,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "pricingType" "public"."PricingType" NOT NULL DEFAULT 'one_time',
ADD COLUMN     "totalChapters" INTEGER DEFAULT 0,
ADD COLUMN     "totalLessons" INTEGER DEFAULT 0,
ALTER COLUMN "thumbnailUrl" DROP NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."email_messages" ALTER COLUMN "providerMessageID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."invoices" DROP COLUMN "coachID",
DROP COLUMN "transactionID",
ADD COLUMN     "customerID" UUID NOT NULL,
ADD COLUMN     "customerType" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "coachID",
ADD COLUMN     "communityID" UUID,
ADD COLUMN     "courseID" UUID,
ADD COLUMN     "invoiceID" UUID,
ADD COLUMN     "payeeID" UUID,
ADD COLUMN     "payeeType" VARCHAR(20),
ADD COLUMN     "payerID" UUID NOT NULL,
ADD COLUMN     "payerType" VARCHAR(20) NOT NULL,
ADD COLUMN     "paymentRequestID" UUID,
ADD COLUMN     "platformFeeAmount" INTEGER DEFAULT 0,
ADD COLUMN     "platformFeeRate" DOUBLE PRECISION DEFAULT 0,
ALTER COLUMN "planID" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."payment_links";

-- DropTable
DROP TABLE "public"."subscription";

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" UUID NOT NULL,
    "subscriberID" UUID NOT NULL,
    "subscriberType" VARCHAR(20) NOT NULL,
    "planID" UUID,
    "communityID" UUID,
    "courseID" UUID,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'active',
    "billingCycle" "public"."BillingCycle" NOT NULL DEFAULT 'monthly',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "nextBillingDate" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_requests" (
    "id" UUID NOT NULL,
    "createdByID" UUID NOT NULL,
    "createdByType" VARCHAR(20) NOT NULL,
    "payerID" UUID NOT NULL,
    "payerType" VARCHAR(20) NOT NULL,
    "type" "public"."PaymentRequestType" NOT NULL,
    "planID" UUID,
    "courseID" UUID,
    "communityID" UUID,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "notes" TEXT,
    "stripePaymentLinkID" TEXT,
    "paymentLinkUrl" TEXT,
    "status" "public"."PaymentRequestStatus" NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "paidAmount" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_chapters" (
    "id" UUID NOT NULL,
    "courseID" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "dripDelay" INTEGER DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "course_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_lessons" (
    "id" UUID NOT NULL,
    "chapterID" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "lessonType" VARCHAR(20) NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "videoDuration" INTEGER,
    "pdfUrl" TEXT,
    "dripDelay" INTEGER DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "estimatedMinutes" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "course_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lesson_progress" (
    "id" UUID NOT NULL,
    "enrollmentID" UUID NOT NULL,
    "lessonID" UUID NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMPTZ(6),
    "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
    "progressPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "videoWatchedSeconds" INTEGER DEFAULT 0,
    "videoDurationSeconds" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscriptions_subscriberID_subscriberType_idx" ON "public"."subscriptions"("subscriberID", "subscriberType");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_requests_stripePaymentLinkID_key" ON "public"."payment_requests"("stripePaymentLinkID");

-- CreateIndex
CREATE INDEX "payment_requests_payerID_payerType_idx" ON "public"."payment_requests"("payerID", "payerType");

-- CreateIndex
CREATE INDEX "payment_requests_createdByID_createdByType_idx" ON "public"."payment_requests"("createdByID", "createdByType");

-- CreateIndex
CREATE INDEX "payment_requests_status_idx" ON "public"."payment_requests"("status");

-- CreateIndex
CREATE INDEX "course_chapters_courseID_idx" ON "public"."course_chapters"("courseID");

-- CreateIndex
CREATE UNIQUE INDEX "course_chapters_courseID_orderIndex_key" ON "public"."course_chapters"("courseID", "orderIndex");

-- CreateIndex
CREATE INDEX "course_lessons_chapterID_idx" ON "public"."course_lessons"("chapterID");

-- CreateIndex
CREATE UNIQUE INDEX "course_lessons_chapterID_orderIndex_key" ON "public"."course_lessons"("chapterID", "orderIndex");

-- CreateIndex
CREATE INDEX "lesson_progress_lessonID_idx" ON "public"."lesson_progress"("lessonID");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_enrollmentID_lessonID_key" ON "public"."lesson_progress"("enrollmentID", "lessonID");

-- CreateIndex
CREATE INDEX "course_enrollments_nextPaymentDue_idx" ON "public"."course_enrollments"("nextPaymentDue");

-- CreateIndex
CREATE INDEX "courses_isActive_isPublished_idx" ON "public"."courses"("isActive", "isPublished");

-- CreateIndex
CREATE INDEX "courses_pricingType_idx" ON "public"."courses"("pricingType");

-- CreateIndex
CREATE INDEX "invoices_customerID_customerType_idx" ON "public"."invoices"("customerID", "customerType");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- CreateIndex
CREATE INDEX "transactions_payerID_payerType_idx" ON "public"."transactions"("payerID", "payerType");

-- CreateIndex
CREATE INDEX "transactions_payeeID_payeeType_idx" ON "public"."transactions"("payeeID", "payeeType");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "public"."transactions"("status");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_subscriptionID_fkey" FOREIGN KEY ("subscriptionID") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_paymentRequestID_fkey" FOREIGN KEY ("paymentRequestID") REFERENCES "public"."payment_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_invoiceID_fkey" FOREIGN KEY ("invoiceID") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_planID_fkey" FOREIGN KEY ("planID") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_subscriptionID_fkey" FOREIGN KEY ("subscriptionID") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_planID_fkey" FOREIGN KEY ("planID") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_chapters" ADD CONSTRAINT "course_chapters_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_lessons" ADD CONSTRAINT "course_lessons_chapterID_fkey" FOREIGN KEY ("chapterID") REFERENCES "public"."course_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_enrollmentID_fkey" FOREIGN KEY ("enrollmentID") REFERENCES "public"."course_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_lessonID_fkey" FOREIGN KEY ("lessonID") REFERENCES "public"."course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."idx_course_enrollments_client_id" RENAME TO "course_enrollments_clientID_idx";

-- RenameIndex
ALTER INDEX "public"."idx_course_enrollments_course_id" RENAME TO "course_enrollments_courseID_idx";

-- RenameIndex
ALTER INDEX "public"."idx_course_enrollments_status" RENAME TO "course_enrollments_status_idx";

-- RenameIndex
ALTER INDEX "public"."idx_courses_coach_id" RENAME TO "courses_coachID_idx";

-- RenameIndex
ALTER INDEX "public"."idx_transactions_payment_method_id" RENAME TO "transactions_paymentMethodID_idx";
