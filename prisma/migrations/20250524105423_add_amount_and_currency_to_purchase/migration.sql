-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "currency" TEXT;
