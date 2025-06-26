/*
  Warnings:

  - Added the required column `buttonData` to the `PricingPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `PricingPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PricingPlan" ADD COLUMN     "buttonData" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;
