/*
  Warnings:

  - The values [DAMAGED] on the enum `BookCopyStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `bookcopies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookCopyStatus_new" AS ENUM ('AVAILABLE', 'DONATED', 'REQUESTED', 'CHECKEDOUT', 'INTRANSIT', 'ONHOLD', 'REFERENCEONLY', 'INARCHIVES', 'RESTRICTEDACCESS', 'ONDISPLAY', 'MISSING', 'PROCESSING', 'RESERVED');
ALTER TABLE "bookcopies" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookcopies" ALTER COLUMN "status" TYPE "BookCopyStatus_new" USING ("status"::text::"BookCopyStatus_new");
ALTER TYPE "BookCopyStatus" RENAME TO "BookCopyStatus_old";
ALTER TYPE "BookCopyStatus_new" RENAME TO "BookCopyStatus";
DROP TYPE "BookCopyStatus_old";
ALTER TABLE "bookcopies" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterTable
ALTER TABLE "bookcopies" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL;
