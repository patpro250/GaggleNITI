/*
  Warnings:

  - You are about to drop the column `joined` on the `librarians` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `members` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `InterLibrary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `institutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `librarians` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `libraries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterLibrary" ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "librarians" DROP COLUMN "joined",
ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "libraries" ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "members" DROP COLUMN "joinedAt",
ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL;
