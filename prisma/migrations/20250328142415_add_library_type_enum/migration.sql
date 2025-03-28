/*
  Warnings:

  - Changed the type of `type` on the `libraries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LibraryType" AS ENUM ('PUBLIC', 'ACADEMIC', 'SCHOOL', 'SPECIAL', 'NATIONAL', 'DIGITAL', 'RESEARCH', 'PRIVATE', 'CHILDREN', 'REFERENCE');

-- AlterTable
ALTER TABLE "libraries" DROP COLUMN "type",
ADD COLUMN     "type" "LibraryType" NOT NULL;
