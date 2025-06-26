/*
  Warnings:

  - You are about to drop the column `status` on the `circulations` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BookRequestStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- AlterTable
ALTER TABLE "circulations" DROP COLUMN "status";

-- DropEnum
DROP TYPE "LendingStatus";

-- CreateTable
CREATE TABLE "bookRequests" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "BookRequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "bookRequests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookRequests" ADD CONSTRAINT "bookRequests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookRequests" ADD CONSTRAINT "bookRequests_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "bookcopies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
