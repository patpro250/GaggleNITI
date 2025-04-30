/*
  Warnings:

  - Added the required column `institutionId` to the `reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookCopyStatus" ADD VALUE 'RESERVED';

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "institutionId" TEXT NOT NULL,
ADD COLUMN     "librarianId" TEXT;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "librarians"("librarianId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
