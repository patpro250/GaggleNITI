/*
  Warnings:

  - You are about to drop the column `institutionTypeId` on the `institutions` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `libraries` table. All the data in the column will be lost.
  - You are about to drop the `LibraryType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `institutionsTypes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `institutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `institutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `libraries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "libraries" DROP CONSTRAINT "libraries_typeId_fkey";

-- DropIndex
DROP INDEX "libraries_typeId_key";

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "institutionTypeId",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "libraries" DROP COLUMN "typeId",
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "LibraryType";

-- DropTable
DROP TABLE "institutionsTypes";
