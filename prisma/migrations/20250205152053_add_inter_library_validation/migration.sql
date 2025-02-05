-- DropIndex
DROP INDEX "InterLibrary_bookId_key";

-- AlterTable
ALTER TABLE "InterLibrary" ALTER COLUMN "dueDate" DROP NOT NULL;
