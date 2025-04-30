-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CLOSED', 'ACTIVE', 'UNDERRENOVATION');

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "openingHours" TEXT,
    "email" TEXT NOT NULL,
    "managerId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "established" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "institutionTypeId" TEXT,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutionsTypes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "institutionsTypes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_email_key" ON "institutions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_institutionTypeId_key" ON "institutions"("institutionTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "institutionsTypes_name_key" ON "institutionsTypes"("name");

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_institutionTypeId_fkey" FOREIGN KEY ("institutionTypeId") REFERENCES "institutionsTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
