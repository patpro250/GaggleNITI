-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "published" TIMESTAMP(3) NULL,
    "firstAquistion" TIMESTAMP(3)  NULL,
    "isbn" TEXT  NULL,
    "language" TEXT  NULL,
    "edition" TEXT  NULL,
    "numberOfPages" INTEGER NULL,
    "shelfLocation" TEXT  NULL,
    "callNo" TEXT NULL,
    "barCode" TEXT NULL,
    "ddcCode" TEXT,
    -- "placeOfPublication" TEXT NULL,
    "institutionId" TEXT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "name" TEXT UNIQUE NOT NULL,
    -- "bookId" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- CREATE UNIQUE INDEX "genres_bookId_key" ON "genres"("bookId");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE "genres" ADD CONSTRAINT "genres_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
