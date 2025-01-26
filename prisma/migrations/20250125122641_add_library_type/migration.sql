/*
  Warnings:

  - The values [ISSUED,BOUGHT,RESERVED] on the enum `BookCopyStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REQUESTED] on the enum `interLibraryStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[typeId]` on the table `libraries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typeId` to the `libraries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookCopyStatus_new" AS ENUM ('AVAILABLE', 'DONATED', 'REQUESTED', 'CHECKEDOUT', 'INTRANSIT', 'ONHOLD', 'REFERENCEONLY', 'INARCHIVES', 'RESTRICTEDACCESS', 'ONDISPLAY', 'MISSING', 'PROCESSING');
ALTER TABLE "BookCopys" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "BookCopys" ALTER COLUMN "status" TYPE "BookCopyStatus_new" USING ("status"::text::"BookCopyStatus_new");
ALTER TYPE "BookCopyStatus" RENAME TO "BookCopyStatus_old";
ALTER TYPE "BookCopyStatus_new" RENAME TO "BookCopyStatus";
DROP TYPE "BookCopyStatus_old";
ALTER TABLE "BookCopys" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "interLibraryStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED');
ALTER TABLE "InterLibrary" ALTER COLUMN "status" TYPE "interLibraryStatus_new" USING ("status"::text::"interLibraryStatus_new");
ALTER TYPE "interLibraryStatus" RENAME TO "interLibraryStatus_old";
ALTER TYPE "interLibraryStatus_new" RENAME TO "interLibraryStatus";
DROP TYPE "interLibraryStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "libraries" ADD COLUMN     "typeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "LibraryType" (
    "id" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAudeince" TEXT NOT NULL,
    "primaryPurpose" TEXT NOT NULL,
    "collectionFocus" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "accessibleLevel" TEXT NOT NULL,
    "fundingSource" TEXT NOT NULL,

    CONSTRAINT "LibraryType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "libraries_typeId_key" ON "libraries"("typeId");

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "LibraryType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
