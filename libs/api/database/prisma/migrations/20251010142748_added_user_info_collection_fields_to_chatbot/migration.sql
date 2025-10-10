-- AlterTable
ALTER TABLE "public"."chatbot_customizations" ADD COLUMN     "requireEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireName" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requirePhone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireUserInfo" BOOLEAN NOT NULL DEFAULT false;
