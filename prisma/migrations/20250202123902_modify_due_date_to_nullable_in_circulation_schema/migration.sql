/*
  Warnings:

  - Made the column `dueDate` on table `Circulation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Circulation" ALTER COLUMN "returnDate" DROP NOT NULL,
ALTER COLUMN "dueDate" SET NOT NULL;
