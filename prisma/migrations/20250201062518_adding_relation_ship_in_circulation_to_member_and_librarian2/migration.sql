/*
  Warnings:

  - You are about to drop the column `librarianId` on the `Circulation` table. All the data in the column will be lost.
  - Added the required column `librarianIdNo` to the `Circulation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Circulation" DROP COLUMN "librarianId",
ADD COLUMN     "librarianIdNo" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Circulation" ADD CONSTRAINT "Circulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Circulation" ADD CONSTRAINT "Circulation_librarianIdNo_fkey" FOREIGN KEY ("librarianIdNo") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;
