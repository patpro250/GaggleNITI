/*
  Warnings:

  - You are about to drop the column `managerId` on the `institutions` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `libraries` table. All the data in the column will be lost.
  - Added the required column `directorId` to the `libraries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_managerId_fkey";

-- DropForeignKey
ALTER TABLE "libraries" DROP CONSTRAINT "libraries_managerId_fkey";

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "managerId";

-- AlterTable
ALTER TABLE "libraries" DROP COLUMN "managerId",
ADD COLUMN     "directorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;
