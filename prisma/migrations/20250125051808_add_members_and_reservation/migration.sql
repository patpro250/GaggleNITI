-- CreateEnum
CREATE TYPE "memberShipType" AS ENUM ('STUDENT', 'REGULAR');

-- CreateEnum
CREATE TYPE "memberShipStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "memberShipType" "memberShipType" NOT NULL,
    "status" "memberShipStatus" NOT NULL,
    "classRoom" TEXT,
    "cardNo" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "doneOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_email_idx" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_cardNo_idx" ON "members"("cardNo");

-- CreateIndex
CREATE INDEX "members_firstName_lastName_idx" ON "members"("firstName", "lastName");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_copyId_key" ON "reservations"("copyId");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "BookCopys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
