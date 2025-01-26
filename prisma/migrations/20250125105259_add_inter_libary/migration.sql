-- CreateEnum
CREATE TYPE "interLibraryStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RETURNED');

-- CreateTable
CREATE TABLE "InterLibrary" (
    "id" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "borrowDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "status" "interLibraryStatus" NOT NULL,

    CONSTRAINT "InterLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterLibrary_bookId_key" ON "InterLibrary"("bookId");

-- AddForeignKey
ALTER TABLE "InterLibrary" ADD CONSTRAINT "InterLibrary_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterLibrary" ADD CONSTRAINT "InterLibrary_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterLibrary" ADD CONSTRAINT "InterLibrary_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "BookCopys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
