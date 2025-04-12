/*
  Warnings:

  - The values [SECONDARY_SCHOOL,PRIMARY_SCHOOL,TVET] on the enum `InstitutionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InstitutionType_new" AS ENUM ('UNIVERSITY', 'SCHOOL', 'PUBLIC_LIBRARY', 'PRIVATE_LIBRARY', 'NON_PROFIT', 'OTHER');
ALTER TABLE "institutions" ALTER COLUMN "type" TYPE "InstitutionType_new" USING ("type"::text::"InstitutionType_new");
ALTER TYPE "InstitutionType" RENAME TO "InstitutionType_old";
ALTER TYPE "InstitutionType_new" RENAME TO "InstitutionType";
DROP TYPE "InstitutionType_old";
COMMIT;
