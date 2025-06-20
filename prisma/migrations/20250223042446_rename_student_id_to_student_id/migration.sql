/*
  Warnings:

  - You are about to drop the column `StudentId` on the `Circulation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Circulation" DROP CONSTRAINT "Circulation_StudentId_fkey";

-- AlterTable
ALTER TABLE "Circulation" DROP COLUMN "StudentId",
ADD COLUMN     "studentId" TEXT;

-- AddForeignKey
ALTER TABLE "Circulation" ADD CONSTRAINT "Circulation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
