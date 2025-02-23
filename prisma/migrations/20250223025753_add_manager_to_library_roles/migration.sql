/*
  Warnings:

  - You are about to drop the column `directorId` on the `libraries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[managerId]` on the table `libraries` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- DropForeignKey
ALTER TABLE "libraries" DROP CONSTRAINT "libraries_directorId_fkey";

-- DropIndex
DROP INDEX "libraries_directorId_key";

-- AlterTable
ALTER TABLE "libraries" DROP COLUMN "directorId",
ADD COLUMN     "managerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "libraries_managerId_key" ON "libraries"("managerId");

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "librarians"("librarianId") ON DELETE SET NULL ON UPDATE CASCADE;
