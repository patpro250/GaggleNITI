-- AlterEnum
ALTER TYPE "interLibraryStatus" ADD VALUE 'RECEIVED';

-- DropForeignKey
ALTER TABLE "InterLibrary" DROP CONSTRAINT "InterLibrary_bookId_fkey";

-- AlterTable
ALTER TABLE "InterLibrary" ADD COLUMN     "copies" TEXT[];

-- AddForeignKey
ALTER TABLE "InterLibrary" ADD CONSTRAINT "InterLibrary_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
