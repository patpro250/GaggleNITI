/*
  Warnings:

  - Made the column `code` on table `BookCopys` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "BookCopys_code_key";

-- AlterTable
ALTER TABLE "BookCopys" ALTER COLUMN "code" SET NOT NULL;
