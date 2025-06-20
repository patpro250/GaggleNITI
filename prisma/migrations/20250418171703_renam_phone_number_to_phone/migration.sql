/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `SystemAdmin` table. All the data in the column will be lost.
  - Added the required column `phone` to the `SystemAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SystemAdmin" DROP COLUMN "phoneNumber",
ADD COLUMN     "phone" TEXT NOT NULL;
