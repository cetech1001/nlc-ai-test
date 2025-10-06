-- AlterTable
ALTER TABLE "public"."clients" ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."coaches" ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."leads" ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false;
