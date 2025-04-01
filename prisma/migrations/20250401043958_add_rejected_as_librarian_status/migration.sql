-- AlterEnum
ALTER TYPE "LibrarianStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "librarians" ALTER COLUMN "status" SET DEFAULT 'PENDING';
