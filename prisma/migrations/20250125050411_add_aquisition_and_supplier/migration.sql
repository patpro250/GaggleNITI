-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'VERIFIED', 'PREFFERED');

-- CreateTable
CREATE TABLE "Aquisitions" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "librarianId" TEXT NOT NULL,
    "doneOn" TIMESTAMP(3) NOT NULL,
    "insititutionId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,

    CONSTRAINT "Aquisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_email_key" ON "Suppliers"("email");

-- AddForeignKey
ALTER TABLE "Aquisitions" ADD CONSTRAINT "Aquisitions_insititutionId_fkey" FOREIGN KEY ("insititutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aquisitions" ADD CONSTRAINT "Aquisitions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aquisitions" ADD CONSTRAINT "Aquisitions_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
