/*
  Warnings:

  - You are about to drop the column `firstAquistion` on the `books` table. All the data in the column will be lost.
  - Added the required column `firstAquisition` to the `books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "firstAquistion",
ADD COLUMN     "firstAquisition" TIMESTAMP(3) NOT NULL;
