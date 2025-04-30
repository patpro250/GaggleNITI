/*
  Warnings:

  - You are about to drop the column `institutionId` on the `Acquisitions` table. All the data in the column will be lost.
  - Added the required column `libraryId` to the `Acquisitions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Acquisitions" DROP CONSTRAINT "Acquisitions_institutionId_fkey";

-- AlterTable
ALTER TABLE "Acquisitions" DROP COLUMN "institutionId",
ADD COLUMN     "libraryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Acquisitions" ADD CONSTRAINT "Acquisitions_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
