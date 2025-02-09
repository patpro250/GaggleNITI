/*
  Warnings:

  - You are about to drop the column `cardNo` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `classRoom` on the `members` table. All the data in the column will be lost.
  - Added the required column `gender` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "members_cardNo_idx";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "cardNo",
DROP COLUMN "classRoom",
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "profile" JSONB NOT NULL;
