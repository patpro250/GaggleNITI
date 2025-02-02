/*
  Warnings:

  - Added the required column `institutionId` to the `Circulation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Circulation" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Circulation" ADD CONSTRAINT "Circulation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
