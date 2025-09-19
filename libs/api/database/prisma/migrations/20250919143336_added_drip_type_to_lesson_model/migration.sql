-- CreateEnum
CREATE TYPE "public"."LessonDripType" AS ENUM ('course_start', 'previous_lesson');

-- AlterTable
ALTER TABLE "public"."course_lessons" ADD COLUMN     "dripType" "public"."LessonDripType";
