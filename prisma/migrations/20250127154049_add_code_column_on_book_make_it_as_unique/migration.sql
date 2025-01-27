/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `BookCopys` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BookCopys" ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "code" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "BookCopys_code_key" ON "BookCopys"("code");
