/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `librarians` table. All the data in the column will be lost.
  - Added the required column `gender` to the `librarians` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `librarians` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DIRECTOR', 'ASSISTANT', 'CATALOGER', 'REFERENCE_LIBRARIAN', 'CIRCULATION_LIBRARIAN', 'ARCHIVIST', 'DIGITAL_LIBRARIAN', 'SYSTEMS_LIBRARIAN', 'ACQUISITIONS_LIBRARIAN', 'YOUTH_LIBRARIAN', 'LAW_LIBRARIAN', 'MEDICAL_LIBRARIAN', 'SCHOOL_LIBRARIAN', 'PUBLIC_SERVICES_LIBRARIAN', 'INTERLIBRARY_LOAN_LIBRARIAN', 'ADMINISTRATOR', 'RESEARCH_LIBRARIAN', 'SERIALS_LIBRARIAN', 'SPECIAL_COLLECTIONS_LIBRARIAN', 'TECHNICAL_LIBRARIAN', 'EVENTS_COORDINATOR', 'VOLUNTEER_COORDINATOR');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'WRITE', 'DELETE', 'MANAGE_USERS', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('F', 'M', 'O');

-- AlterTable
ALTER TABLE "librarians" DROP COLUMN "isAdmin",
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "permissions" "Permission"[],
ADD COLUMN     "role" "Role" NOT NULL;
