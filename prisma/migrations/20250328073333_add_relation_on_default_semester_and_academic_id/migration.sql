-- AddForeignKey
ALTER TABLE "defaultSemesters" ADD CONSTRAINT "defaultSemesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "defaultAcademicYears"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
