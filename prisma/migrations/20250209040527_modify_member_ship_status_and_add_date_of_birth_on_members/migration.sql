/*
  Warnings:

  - You are about to drop the column `established` on the `institutions` table. All the data in the column will be lost.
  - The `status` column on the `members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `dateOfBirth` to the `members` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `memberShipType` on the `members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('STUDENT', 'REGULAR', 'SENIOR', 'PREMIUM', 'TEMPORARY', 'LIFETIME', 'FAMILY', 'CORPORATE', 'VIP');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'BANNED', 'EXPIRED', 'ON_HOLD', 'DECEASED', 'BLACKLISTED', 'PROBATION', 'GUEST', 'FROZEN');

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "established",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
DROP COLUMN "memberShipType",
ADD COLUMN     "memberShipType" "MembershipType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "memberShipStatus";

-- DropEnum
DROP TYPE "memberShipType";
