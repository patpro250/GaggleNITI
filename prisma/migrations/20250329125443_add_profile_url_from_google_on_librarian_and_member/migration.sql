-- AlterTable
ALTER TABLE "librarians" ADD COLUMN     "profile" TEXT;

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "profile" DROP NOT NULL,
ALTER COLUMN "profile" SET DATA TYPE TEXT;
