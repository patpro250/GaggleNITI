/*
  Warnings:

  - Made the column `published` on table `books` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstAquistion` on table `books` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latestAquistion` on table `books` required. This step will fail if there are existing NULL values in that column.
  - Made the column `language` on table `books` required. This step will fail if there are existing NULL values in that column.
  - Made the column `edition` on table `books` required. This step will fail if there are existing NULL values in that column.
  - Made the column `numberOfPages` on table `books` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shelfLocation` on table `books` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "books" ADD COLUMN     "genreId" INTEGER,
ALTER COLUMN "published" SET NOT NULL,
ALTER COLUMN "firstAquistion" SET NOT NULL,
-- ALTER COLUMN "latestAquistion" SET NOT NULL,
ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "edition" SET NOT NULL,
ALTER COLUMN "numberOfPages" SET NOT NULL,
ALTER COLUMN "shelfLocation" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE SET NULL ON UPDATE CASCADE;
