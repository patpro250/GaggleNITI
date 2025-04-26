/*
  Warnings:

  - The values [PREFFERED] on the enum `SupplierStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `genreId` on the `books` table. All the data in the column will be lost.
  - You are about to drop the `BookCopys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `genres` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SupplierStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'VERIFIED', 'PREFERRED');
ALTER TABLE "Suppliers" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Suppliers" ALTER COLUMN "status" TYPE "SupplierStatus_new" USING ("status"::text::"SupplierStatus_new");
ALTER TYPE "SupplierStatus" RENAME TO "SupplierStatus_old";
ALTER TYPE "SupplierStatus_new" RENAME TO "SupplierStatus";
DROP TYPE "SupplierStatus_old";
ALTER TABLE "Suppliers" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "BookCopys" DROP CONSTRAINT "BookCopys_bookId_fkey";

-- DropForeignKey
ALTER TABLE "BookCopys" DROP CONSTRAINT "BookCopys_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "Circulation" DROP CONSTRAINT "Circulation_copyId_fkey";

-- DropForeignKey
ALTER TABLE "InterLibrary" DROP CONSTRAINT "InterLibrary_bookId_fkey";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_genreId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_copyId_fkey";

-- AlterTable
ALTER TABLE "books" DROP COLUMN "genreId",
ADD COLUMN     "genre" TEXT;

-- DropTable
DROP TABLE "BookCopys";

-- DropTable
DROP TABLE "genres";

-- CreateTable
CREATE TABLE "bookcopies" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" "BookCopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "libraryId" TEXT NOT NULL,
    "condition" "Condition" NOT NULL DEFAULT 'NEW',
    "dateOfAcquisition" TIMESTAMP(3) NOT NULL,
    "code" TEXT,

    CONSTRAINT "bookcopies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookcopies_id_key" ON "bookcopies"("id");

-- CreateIndex
CREATE INDEX "bookcopies_code_idx" ON "bookcopies"("code");

-- AddForeignKey
ALTER TABLE "bookcopies" ADD CONSTRAINT "bookcopies_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookcopies" ADD CONSTRAINT "bookcopies_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Circulation" ADD CONSTRAINT "Circulation_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "bookcopies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterLibrary" ADD CONSTRAINT "InterLibrary_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "bookcopies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "bookcopies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
