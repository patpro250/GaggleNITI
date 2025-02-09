-- CreateTable
CREATE TABLE "Circulation" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insitutionId" TEXT NOT NULL,
    "librarianId" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "lendDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Circulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "librarians" (
    "librarianId" TEXT NOT NULL,
    "institutionId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" VARCHAR(2055) NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "librarians_pkey" PRIMARY KEY ("librarianId")
);

-- CreateIndex
CREATE UNIQUE INDEX "librarians_email_key" ON "librarians"("email");

-- AddForeignKey
ALTER TABLE "Acquisitions" ADD CONSTRAINT "Acquisitions_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCopys" ADD CONSTRAINT "BookCopys_circulationId_fkey" FOREIGN KEY ("circulationId") REFERENCES "Circulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "librarians" ADD CONSTRAINT "librarians_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;
