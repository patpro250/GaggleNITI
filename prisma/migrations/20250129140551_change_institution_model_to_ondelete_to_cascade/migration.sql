-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_institutionId_fkey";

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
