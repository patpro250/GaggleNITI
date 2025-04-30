-- DropForeignKey
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_institutionTypeId_fkey";

-- DropIndex
DROP INDEX "institutions_institutionTypeId_key";
