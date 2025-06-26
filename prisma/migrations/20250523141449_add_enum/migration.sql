/*
  Warnings:

  - You are about to drop the `Acquisitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterLibrary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricingPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Suppliers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemAdmin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemConstants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LibraryLibrarians` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `academicYears` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookRequests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookcopies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `books` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `catalogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `circulations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `defaultAcademicYears` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `defaultSemesters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favoriteBooks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `institutions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `librarians` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `libraries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `semesters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Acquisitions" DROP CONSTRAINT "Acquisitions_bookId_fkey";

-- DropForeignKey
ALTER TABLE "Acquisitions" DROP CONSTRAINT "Acquisitions_librarianId_fkey";

-- DropForeignKey
ALTER TABLE "Acquisitions" DROP CONSTRAINT "Acquisitions_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "Acquisitions" DROP CONSTRAINT "Acquisitions_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "InterLibrary" DROP CONSTRAINT "InterLibrary_bookId_fkey";

-- DropForeignKey
ALTER TABLE "InterLibrary" DROP CONSTRAINT "InterLibrary_borrowerId_fkey";

-- DropForeignKey
ALTER TABLE "InterLibrary" DROP CONSTRAINT "InterLibrary_lenderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_planId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_planId_fkey";

-- DropForeignKey
ALTER TABLE "_LibraryLibrarians" DROP CONSTRAINT "_LibraryLibrarians_A_fkey";

-- DropForeignKey
ALTER TABLE "_LibraryLibrarians" DROP CONSTRAINT "_LibraryLibrarians_B_fkey";

-- DropForeignKey
ALTER TABLE "academicYears" DROP CONSTRAINT "academicYears_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "bookRequests" DROP CONSTRAINT "bookRequests_copyId_fkey";

-- DropForeignKey
ALTER TABLE "bookRequests" DROP CONSTRAINT "bookRequests_userId_fkey";

-- DropForeignKey
ALTER TABLE "bookcopies" DROP CONSTRAINT "bookcopies_bookId_fkey";

-- DropForeignKey
ALTER TABLE "bookcopies" DROP CONSTRAINT "bookcopies_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "circulations" DROP CONSTRAINT "circulations_copyId_fkey";

-- DropForeignKey
ALTER TABLE "circulations" DROP CONSTRAINT "circulations_librarianIdNo_fkey";

-- DropForeignKey
ALTER TABLE "circulations" DROP CONSTRAINT "circulations_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "circulations" DROP CONSTRAINT "circulations_studentId_fkey";

-- DropForeignKey
ALTER TABLE "circulations" DROP CONSTRAINT "circulations_userId_fkey";

-- DropForeignKey
ALTER TABLE "defaultSemesters" DROP CONSTRAINT "defaultSemesters_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "favoriteBooks" DROP CONSTRAINT "favoriteBooks_bookId_fkey";

-- DropForeignKey
ALTER TABLE "favoriteBooks" DROP CONSTRAINT "favoriteBooks_memberId_fkey";

-- DropForeignKey
ALTER TABLE "librarians" DROP CONSTRAINT "librarians_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "libraries" DROP CONSTRAINT "libraries_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "libraries" DROP CONSTRAINT "libraries_managerId_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_librarianId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_copyId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_librarianId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_memberId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_studentId_fkey";

-- DropForeignKey
ALTER TABLE "semesters" DROP CONSTRAINT "semesters_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_institutionId_fkey";

-- DropTable
DROP TABLE "Acquisitions";

-- DropTable
DROP TABLE "InterLibrary";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "PricingPlan";

-- DropTable
DROP TABLE "Purchase";

-- DropTable
DROP TABLE "Suppliers";

-- DropTable
DROP TABLE "SystemAdmin";

-- DropTable
DROP TABLE "SystemConstants";

-- DropTable
DROP TABLE "_LibraryLibrarians";

-- DropTable
DROP TABLE "academicYears";

-- DropTable
DROP TABLE "bookRequests";

-- DropTable
DROP TABLE "bookcopies";

-- DropTable
DROP TABLE "books";

-- DropTable
DROP TABLE "catalogs";

-- DropTable
DROP TABLE "circulations";

-- DropTable
DROP TABLE "defaultAcademicYears";

-- DropTable
DROP TABLE "defaultSemesters";

-- DropTable
DROP TABLE "favoriteBooks";

-- DropTable
DROP TABLE "institutions";

-- DropTable
DROP TABLE "librarians";

-- DropTable
DROP TABLE "libraries";

-- DropTable
DROP TABLE "members";

-- DropTable
DROP TABLE "reports";

-- DropTable
DROP TABLE "reservations";

-- DropTable
DROP TABLE "semesters";

-- DropTable
DROP TABLE "students";

-- DropEnum
DROP TYPE "BookCopyStatus";

-- DropEnum
DROP TYPE "BookRequestStatus";

-- DropEnum
DROP TYPE "Condition";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "InstitutionType";

-- DropEnum
DROP TYPE "LibrarianStatus";

-- DropEnum
DROP TYPE "LibraryType";

-- DropEnum
DROP TYPE "MediaType";

-- DropEnum
DROP TYPE "MemberStatus";

-- DropEnum
DROP TYPE "MembershipType";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "Permission";

-- DropEnum
DROP TYPE "PlanStatus";

-- DropEnum
DROP TYPE "PurchaseStatus";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "ReservationStatus";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Status";

-- DropEnum
DROP TYPE "StudentStatus";

-- DropEnum
DROP TYPE "SupplierStatus";

-- DropEnum
DROP TYPE "interLibraryStatus";
