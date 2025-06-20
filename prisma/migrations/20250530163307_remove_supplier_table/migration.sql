/*
  Warnings:

  - You are about to drop the column `supplierId` on the `Acquisitions` table. All the data in the column will be lost.
  - You are about to drop the `Suppliers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `supplier` to the `Acquisitions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Acquisitions" DROP CONSTRAINT "Acquisitions_supplierId_fkey";

-- AlterTable
ALTER TABLE "Acquisitions" DROP COLUMN "supplierId",
ADD COLUMN     "supplier" TEXT NOT NULL;

-- DropTable
DROP TABLE "Suppliers";
