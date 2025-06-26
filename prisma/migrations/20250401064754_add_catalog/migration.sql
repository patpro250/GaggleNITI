-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('AUDIO', 'EBOOK', 'HARD_COVER');

-- CreateTable
CREATE TABLE "catalogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "published" TIMESTAMP(3) NOT NULL,
    "publisher" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ddcCode" TEXT NOT NULL,
    "placeOfPublication" TEXT,
    "lccCode" TEXT NOT NULL,
    "callNo" TEXT NOT NULL,
    "keywords" TEXT[],
    "format" "MediaType" NOT NULL,
    "edition" TEXT,
    "pages" INTEGER,
    "coverImageURL" TEXT,
    "shelfLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogs_isbn_key" ON "catalogs"("isbn");

-- CreateIndex
CREATE INDEX "catalogs_title_idx" ON "catalogs"("title");

-- CreateIndex
CREATE INDEX "catalogs_author_idx" ON "catalogs"("author");

-- CreateIndex
CREATE INDEX "catalogs_isbn_idx" ON "catalogs"("isbn");

-- CreateIndex
CREATE INDEX "catalogs_publisher_idx" ON "catalogs"("publisher");
