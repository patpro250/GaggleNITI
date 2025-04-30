/*
  Warnings:

  - You are about to drop the column `circulationId` on the `BookCopys` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[copyId]` on the table `Circulation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BookCopys" DROP CONSTRAINT "BookCopys_circulationId_fkey";

-- DropIndex
DROP INDEX "BookCopys_circulationId_key";

-- AlterTable
ALTER TABLE "BookCopys" DROP COLUMN "circulationId";

-- CreateIndex
CREATE UNIQUE INDEX "Circulation_copyId_key" ON "Circulation"("copyId");

-- AddForeignKey
ALTER TABLE "Circulation" ADD CONSTRAINT "Circulation_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "BookCopys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
