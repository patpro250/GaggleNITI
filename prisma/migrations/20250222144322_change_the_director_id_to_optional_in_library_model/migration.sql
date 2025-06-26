-- DropForeignKey
ALTER TABLE "libraries" DROP CONSTRAINT "libraries_directorId_fkey";

-- AlterTable
ALTER TABLE "libraries" ALTER COLUMN "directorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "librarians"("librarianId") ON DELETE SET NULL ON UPDATE CASCADE;
