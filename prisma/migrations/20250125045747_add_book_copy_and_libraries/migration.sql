-- CreateEnum
CREATE TYPE "BookCopyStatus" AS ENUM ('AVAILABLE', 'ISSUED', 'BOUGHT', 'RESERVED');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'GOOD', 'DAMAGED');

-- CreateTable
CREATE TABLE "BookCopys" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" "BookCopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "libraryId" TEXT NOT NULL,
    "condition" "Condition" NOT NULL DEFAULT 'NEW',
    "dateOfAquisition" TIMESTAMP(3) NOT NULL,
    "circulationId" TEXT NOT NULL,

    CONSTRAINT "BookCopys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "libraries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "institutionId" TEXT NOT NULL,
    "shelvesNo" INTEGER NOT NULL,

    CONSTRAINT "libraries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookCopys_id_key" ON "BookCopys"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BookCopys_circulationId_key" ON "BookCopys"("circulationId");

-- CreateIndex
CREATE UNIQUE INDEX "libraries_id_key" ON "libraries"("id");

-- AddForeignKey
ALTER TABLE "BookCopys" ADD CONSTRAINT "BookCopys_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCopys" ADD CONSTRAINT "BookCopys_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
