/*
  Warnings:

  - You are about to drop the `Circulation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Circulation" DROP CONSTRAINT "Circulation_copyId_fkey";

-- DropForeignKey
ALTER TABLE "Circulation" DROP CONSTRAINT "Circulation_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "Circulation" DROP CONSTRAINT "Circulation_librarianIdNo_fkey";

-- DropForeignKey
ALTER TABLE "Circulation" DROP CONSTRAINT "Circulation_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Circulation" DROP CONSTRAINT "Circulation_userId_fkey";

-- DropTable
DROP TABLE "Circulation";

-- CreateTable
CREATE TABLE "circulations" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "userId" TEXT,
    "studentId" TEXT,
    "librarianIdNo" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3),
    "lendDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circulations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "bookcopies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_librarianIdNo_fkey" FOREIGN KEY ("librarianIdNo") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;
