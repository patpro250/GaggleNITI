-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "status" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE';
