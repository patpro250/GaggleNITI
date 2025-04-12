-- CreateEnum
CREATE TYPE "LendingStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- AlterTable
ALTER TABLE "circulations" ADD COLUMN     "status" "LendingStatus" NOT NULL DEFAULT 'PENDING';
