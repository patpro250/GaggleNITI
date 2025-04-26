-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "Circulation" DROP CONSTRAINT "Circulation_userId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_memberId_fkey";

-- AlterTable
ALTER TABLE "Circulation" ADD COLUMN     "StudentId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "studentId" TEXT,
ALTER COLUMN "memberId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL,
    "institutionId" TEXT NOT NULL,
    "email" TEXT,
    "studentCard" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_firstName_idx" ON "students"("firstName");

-- CreateIndex
CREATE INDEX "students_lastName_idx" ON "students"("lastName");

-- CreateIndex
CREATE INDEX "students_code_idx" ON "students"("code");

-- AddForeignKey
ALTER TABLE "Circulation" ADD CONSTRAINT "Circulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Circulation" ADD CONSTRAINT "Circulation_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
