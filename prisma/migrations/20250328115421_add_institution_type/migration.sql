/*
  Warnings:

  - Changed the type of `type` on the `institutions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('UNIVERSITY', 'SECONDARY_SCHOOL', 'PRIMARY_SCHOOL', 'TVET', 'PUBLIC_LIBRARY', 'PRIVATE_LIBRARY', 'NON_PROFIT', 'OTHER');

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "type",
ADD COLUMN     "type" "InstitutionType" NOT NULL;
