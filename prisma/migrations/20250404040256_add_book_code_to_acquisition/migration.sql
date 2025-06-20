/*
  Warnings:

  - Added the required column `bookCode` to the `Acquisitions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Acquisitions" ADD COLUMN     "bookCode" TEXT NOT NULL;
