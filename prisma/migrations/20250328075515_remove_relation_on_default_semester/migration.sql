/*
  Warnings:

  - You are about to drop the column `academicYearId` on the `defaultSemesters` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "defaultSemesters" DROP CONSTRAINT "defaultSemesters_academicYearId_fkey";

-- AlterTable
ALTER TABLE "defaultSemesters" DROP COLUMN "academicYearId";
