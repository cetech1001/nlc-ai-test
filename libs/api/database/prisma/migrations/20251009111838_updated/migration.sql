/*
  Warnings:

  - The `role` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `customDomain` on the `coaches` table. All the data in the column will be lost.
  - You are about to drop the `daily_kpis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('admin');

-- DropForeignKey
ALTER TABLE "public"."daily_kpis" DROP CONSTRAINT "daily_kpis_coachID_fkey";

-- DropForeignKey
ALTER TABLE "public"."system_settings" DROP CONSTRAINT "system_settings_updatedBy_fkey";

-- AlterTable
ALTER TABLE "public"."admins" DROP COLUMN "role",
ADD COLUMN     "role" "public"."AdminRole" NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE "public"."coaches" DROP COLUMN "customDomain";

-- DropTable
DROP TABLE "public"."daily_kpis";

-- DropTable
DROP TABLE "public"."system_settings";
