-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'VERIFIED', 'PREFERRED');

-- CreateEnum
CREATE TYPE "BookCopyStatus" AS ENUM ('AVAILABLE', 'LOST', 'DONATED', 'REQUESTED', 'CHECKEDOUT', 'INTRANSIT', 'ONHOLD', 'REFERENCEONLY', 'INARCHIVES', 'RESTRICTEDACCESS', 'ONDISPLAY', 'MISSING', 'PROCESSING', 'RESERVED');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'GOOD', 'DAMAGED', 'OLD');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('AUDIO', 'EBOOK', 'HARD_COVER');

-- CreateEnum
CREATE TYPE "BookRequestStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CLOSED', 'ACTIVE', 'UNDERRENOVATION');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('UNIVERSITY', 'COLLEGE', 'SCHOOL', 'PUBLIC_LIBRARY', 'PRIVATE_LIBRARY', 'NON_PROFIT', 'OTHER');

-- CreateEnum
CREATE TYPE "interLibraryStatus" AS ENUM ('PENDING', 'APPROVED', 'RECEIVED', 'REJECTED', 'RETURNED', 'PARTIALLY_RETURNED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DIRECTOR', 'MANAGER', 'ASSISTANT', 'CATALOGER', 'REFERENCE_LIBRARIAN', 'CIRCULATION_LIBRARIAN', 'ARCHIVIST', 'DIGITAL_LIBRARIAN', 'ACQUISITIONS_LIBRARIAN', 'YOUTH_LIBRARIAN', 'LAW_LIBRARIAN', 'MEDICAL_LIBRARIAN', 'SCHOOL_LIBRARIAN', 'PUBLIC_SERVICES_LIBRARIAN', 'INTERLIBRARY_LOAN_LIBRARIAN', 'RESEARCH_LIBRARIAN', 'SERIALS_LIBRARIAN', 'SPECIAL_COLLECTIONS_LIBRARIAN', 'TECHNICAL_LIBRARIAN', 'EVENTS_COORDINATOR', 'VOLUNTEER_COORDINATOR');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'WRITE', 'DELETE', 'MANAGE_USERS', 'SYSTEM_ADMIN', 'UPDATE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('F', 'M', 'O');

-- CreateEnum
CREATE TYPE "LibrarianStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE', 'RETIRED', 'TERMINATED', 'PENDING', 'PROBATION', 'RESIGNED', 'TRANSFERRED', 'REJECTED', 'DECEASED');

-- CreateEnum
CREATE TYPE "LibraryType" AS ENUM ('PUBLIC', 'ACADEMIC', 'SCHOOL', 'SPECIAL', 'NATIONAL', 'DIGITAL', 'RESEARCH', 'PRIVATE', 'CHILDREN', 'REFERENCE');

-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('STUDENT', 'REGULAR', 'SENIOR', 'PREMIUM', 'TEMPORARY', 'LIFETIME', 'FAMILY', 'CORPORATE', 'VIP');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'BANNED', 'EXPIRED', 'ON_HOLD', 'DECEASED', 'BLACKLISTED', 'PROBATION', 'GUEST', 'FROZEN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REJECTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CASH');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('FULL', 'CIRCULATION', 'BOOKS', 'RESERVATIONS', 'MEMBERS', 'STUDENTS', 'INTER_LIBRARY', 'ACQUISITIONS');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "academicYears" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "academicYear" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "academicYears_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defaultAcademicYears" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "academicYear" TEXT NOT NULL,

    CONSTRAINT "defaultAcademicYears_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defaultSemesters" (
    "id" TEXT NOT NULL,
    "semesterName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "academicYearId" TEXT NOT NULL,

    CONSTRAINT "defaultSemesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "semesterName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acquisitions" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "librarianId" TEXT NOT NULL,
    "doneOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "libraryId" TEXT NOT NULL,
    "bookCode" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,

    CONSTRAINT "Acquisitions_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "published" TIMESTAMP(3),
    "firstAcquisition" TIMESTAMP(3) NOT NULL,
    "isbn" TEXT,
    "language" TEXT NOT NULL,
    "edition" TEXT,
    "numberOfPages" INTEGER NOT NULL,
    "lccCode" TEXT,
    "ddcCode" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "institutionId" TEXT NOT NULL,
    "genre" TEXT,
    "placeOfPublication" TEXT,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookcopies" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" "BookCopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "libraryId" TEXT NOT NULL,
    "condition" "Condition" NOT NULL DEFAULT 'NEW',
    "dateOfAcquisition" TIMESTAMP(3) NOT NULL,
    "code" TEXT,
    "barCode" TEXT,
    "callNo" TEXT,

    CONSTRAINT "bookcopies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "published" TIMESTAMP(3) NOT NULL,
    "publisher" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ddcCode" TEXT NOT NULL,
    "placeOfPublication" TEXT,
    "lccCode" TEXT NOT NULL,
    "callNo" TEXT NOT NULL,
    "keywords" TEXT[],
    "format" "MediaType" NOT NULL,
    "edition" TEXT,
    "pages" INTEGER,
    "coverImageURL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circulations" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "userId" TEXT,
    "studentId" TEXT,
    "librarianIdNo" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "fine" DECIMAL(65,30),
    "returnDate" TIMESTAMP(3),
    "lendDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "comment" TEXT,

    CONSTRAINT "circulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookRequests" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doneOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BookRequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "bookRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoriteBooks" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoriteBooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "code" TEXT,
    "phone" TEXT NOT NULL,
    "openingHours" TEXT,
    "email" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "password" TEXT NOT NULL,
    "settings" JSONB,
    "type" "InstitutionType" NOT NULL DEFAULT 'SCHOOL',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterLibrary" (
    "id" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "copies" TEXT[],
    "bookId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "borrowDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "reason" TEXT,
    "status" "interLibraryStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "InterLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "librarians" (
    "librarianId" TEXT NOT NULL,
    "institutionId" TEXT,
    "libraryId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile" TEXT,
    "status" "LibrarianStatus" NOT NULL DEFAULT 'PENDING',
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "password" VARCHAR(2055) NOT NULL,
    "role" "Role",
    "permissions" "Permission"[],
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "librarians_pkey" PRIMARY KEY ("librarianId")
);

-- CreateTable
CREATE TABLE "libraries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT,
    "institutionId" TEXT NOT NULL,
    "shelvesNo" INTEGER NOT NULL,
    "numberOfSeats" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "type" "LibraryType" NOT NULL,

    CONSTRAINT "libraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "address" JSONB NOT NULL,
    "memberShipType" "MembershipType" NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "duration" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "limitations" JSONB NOT NULL,
    "discount" DECIMAL(65,30),
    "freeTrialDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "phoneNumber" TEXT,
    "confirmationCode" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "status" "PaymentStatus" NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'MOBILE_MONEY',
    "doneAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isTrial" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "librarianId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'FULL',
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "doneOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "copyId" TEXT NOT NULL,
    "studentId" TEXT,
    "doneOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "librarianId" TEXT,
    "institutionId" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "institutionId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "studentCard" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConstants" (
    "id" TEXT NOT NULL,
    "values" JSONB NOT NULL,

    CONSTRAINT "SystemConstants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAdmin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LibraryLibrarians" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LibraryLibrarians_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "academicYears_institutionId_isActive_idx" ON "academicYears"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "academicYears_institutionId_academicYear_key" ON "academicYears"("institutionId", "academicYear");

-- CreateIndex
CREATE INDEX "semesters_academicYearId_isActive_idx" ON "semesters"("academicYearId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_academicYearId_semesterName_key" ON "semesters"("academicYearId", "semesterName");

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_email_key" ON "Suppliers"("email");

-- CreateIndex
CREATE INDEX "books_institutionId_genre_idx" ON "books"("institutionId", "genre");

-- CreateIndex
CREATE UNIQUE INDEX "bookcopies_id_key" ON "bookcopies"("id");

-- CreateIndex
CREATE INDEX "bookcopies_code_idx" ON "bookcopies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "catalogs_isbn_key" ON "catalogs"("isbn");

-- CreateIndex
CREATE INDEX "catalogs_title_idx" ON "catalogs"("title");

-- CreateIndex
CREATE INDEX "catalogs_author_idx" ON "catalogs"("author");

-- CreateIndex
CREATE INDEX "catalogs_isbn_idx" ON "catalogs"("isbn");

-- CreateIndex
CREATE INDEX "catalogs_publisher_idx" ON "catalogs"("publisher");

-- CreateIndex
CREATE UNIQUE INDEX "favoriteBooks_memberId_bookId_key" ON "favoriteBooks"("memberId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_phone_key" ON "institutions"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_email_key" ON "institutions"("email");

-- CreateIndex
CREATE INDEX "institutions_name_email_address_phone_idx" ON "institutions"("name", "email", "address", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "librarians_email_key" ON "librarians"("email");

-- CreateIndex
CREATE UNIQUE INDEX "libraries_id_key" ON "libraries"("id");

-- CreateIndex
CREATE UNIQUE INDEX "libraries_managerId_key" ON "libraries"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_email_idx" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_firstName_lastName_idx" ON "members"("firstName", "lastName");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_name_key" ON "PricingPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "students_code_key" ON "students"("code");

-- CreateIndex
CREATE INDEX "students_firstName_idx" ON "students"("firstName");

-- CreateIndex
CREATE INDEX "students_lastName_idx" ON "students"("lastName");

-- CreateIndex
CREATE INDEX "students_code_idx" ON "students"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SystemAdmin_email_key" ON "SystemAdmin"("email");

-- CreateIndex
CREATE INDEX "_LibraryLibrarians_B_index" ON "_LibraryLibrarians"("B");

-- AddForeignKey
ALTER TABLE "academicYears" ADD CONSTRAINT "academicYears_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defaultSemesters" ADD CONSTRAINT "defaultSemesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "defaultAcademicYears"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academicYears"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acquisitions" ADD CONSTRAINT "Acquisitions_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acquisitions" ADD CONSTRAINT "Acquisitions_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acquisitions" ADD CONSTRAINT "Acquisitions_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acquisitions" ADD CONSTRAINT "Acquisitions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookcopies" ADD CONSTRAINT "bookcopies_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookcopies" ADD CONSTRAINT "bookcopies_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "libraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "bookcopies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circulations" ADD CONSTRAINT "circulations_librarianIdNo_fkey" FOREIGN KEY ("librarianIdNo") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookRequests" ADD CONSTRAINT "bookRequests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookRequests" ADD CONSTRAINT "bookRequests_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "bookcopies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoriteBooks" ADD CONSTRAINT "favoriteBooks_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoriteBooks" ADD CONSTRAINT "favoriteBooks_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterLibrary" ADD CONSTRAINT "InterLibrary_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterLibrary" ADD CONSTRAINT "InterLibrary_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterLibrary" ADD CONSTRAINT "InterLibrary_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "librarians" ADD CONSTRAINT "librarians_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "librarians"("librarianId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "librarians"("librarianId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "librarians"("librarianId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "bookcopies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryLibrarians" ADD CONSTRAINT "_LibraryLibrarians_A_fkey" FOREIGN KEY ("A") REFERENCES "librarians"("librarianId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryLibrarians" ADD CONSTRAINT "_LibraryLibrarians_B_fkey" FOREIGN KEY ("B") REFERENCES "libraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
