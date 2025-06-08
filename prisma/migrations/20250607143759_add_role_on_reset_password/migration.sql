/*
  Warnings:

  - Made the column `role` on table `PasswordReset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PasswordReset" ALTER COLUMN "role" SET NOT NULL;
