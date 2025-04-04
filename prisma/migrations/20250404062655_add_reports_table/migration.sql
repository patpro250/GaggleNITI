-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('FULL', 'CIRCULATION', 'BOOKS', 'RESERVATIONS', 'MEMBERS', 'STUDENTS', 'INTER_LIBRARY', 'ACQUISITIONS');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "librarianId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'FULL',
    "time" TEXT NOT NULL,
    "doneOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;
