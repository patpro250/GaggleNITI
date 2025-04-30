/*
  Warnings:

  - A unique constraint covering the columns `[bookId]` on the table `BookCopys` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BookCopys" ALTER COLUMN "code" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BookCopys_bookId_key" ON "BookCopys"("bookId");
