/*
  Warnings:

  - The `method` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `limitations` to the `PricingPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CASH');

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'MOBILE_MONEY';

-- AlterTable
ALTER TABLE "PricingPlan" ADD COLUMN     "limitations" JSONB NOT NULL,
ADD COLUMN     "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE';
