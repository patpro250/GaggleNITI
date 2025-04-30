/*
  Warnings:

  - Added the required column `dueDate` to the `InterLibrary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterLibrary" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "returnDate" DROP NOT NULL;
