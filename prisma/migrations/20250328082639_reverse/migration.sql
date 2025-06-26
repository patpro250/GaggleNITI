/*
  Warnings:

  - Added the required column `academicYearId` to the `defaultSemesters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "defaultSemesters" ADD COLUMN     "academicYearId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "defaultSemesters" ADD CONSTRAINT "defaultSemesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "defaultAcademicYears"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
