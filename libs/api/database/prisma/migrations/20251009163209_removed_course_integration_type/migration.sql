/*
  Warnings:

  - The values [course] on the enum `IntegrationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."IntegrationType_new" AS ENUM ('social', 'app');
ALTER TABLE "public"."integrations" ALTER COLUMN "integrationType" TYPE "public"."IntegrationType_new" USING ("integrationType"::text::"public"."IntegrationType_new");
ALTER TYPE "public"."IntegrationType" RENAME TO "IntegrationType_old";
ALTER TYPE "public"."IntegrationType_new" RENAME TO "IntegrationType";
DROP TYPE "public"."IntegrationType_old";
COMMIT;
