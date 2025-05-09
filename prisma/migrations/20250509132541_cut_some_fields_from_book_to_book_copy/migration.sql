/*
  Warnings:

  - You are about to drop the column `barCode` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `callNo` on the `books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookcopies" ADD COLUMN     "barCode" TEXT,
ADD COLUMN     "callNo" TEXT;

-- AlterTable
ALTER TABLE "books" DROP COLUMN "barCode",
DROP COLUMN "callNo",
ADD COLUMN     "lccCode" TEXT;
