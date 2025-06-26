/*
  Warnings:

  - You are about to alter the column `fine` on the `members` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "members" ALTER COLUMN "fine" SET DATA TYPE DECIMAL(65,30);
