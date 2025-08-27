/*
  Warnings:

  - You are about to drop the column `coachID` on the `media_files` table. All the data in the column will be lost.
  - You are about to drop the column `coachID` on the `media_transformations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `communities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `communities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `media_transformations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."media_files" DROP CONSTRAINT "media_files_coachID_fkey";

-- DropIndex
DROP INDEX "public"."media_files_coachID_idx";

-- DropIndex
DROP INDEX "public"."media_transformations_coachID_idx";

-- AlterTable
ALTER TABLE "public"."communities" ADD COLUMN     "slug" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "public"."media_files" DROP COLUMN "coachID",
ADD COLUMN     "userID" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."media_transformations" DROP COLUMN "coachID",
ADD COLUMN     "userID" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "communities_slug_key" ON "public"."communities"("slug");

-- CreateIndex
CREATE INDEX "media_files_userID_idx" ON "public"."media_files"("userID");

-- CreateIndex
CREATE INDEX "media_transformations_userID_idx" ON "public"."media_transformations"("userID");
