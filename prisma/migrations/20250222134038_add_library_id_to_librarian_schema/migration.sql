-- AlterTable
ALTER TABLE "librarians" ADD COLUMN     "libraryId" TEXT;

-- AddForeignKey
ALTER TABLE "librarians" ADD CONSTRAINT "librarians_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "libraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
