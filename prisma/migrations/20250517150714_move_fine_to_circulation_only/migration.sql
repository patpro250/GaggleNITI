/*
  Warnings:

  - You are about to drop the column `fine` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `fine` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "circulations" ADD COLUMN     "fine" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "members" DROP COLUMN "fine";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "fine";
