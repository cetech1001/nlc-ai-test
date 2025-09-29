/*
  Warnings:

  - Made the column `isActive` on table `admins` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isVerified` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDeleted` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `coaches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isVerified` on table `coaches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDeleted` on table `coaches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `onboardingCompleted` on table `coaches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `coaches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `coaches` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."admins" ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."clients" ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "isVerified" SET NOT NULL,
ALTER COLUMN "isDeleted" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."coaches" ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "isVerified" SET NOT NULL,
ALTER COLUMN "isDeleted" SET NOT NULL,
ALTER COLUMN "onboardingCompleted" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."post_comments" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
