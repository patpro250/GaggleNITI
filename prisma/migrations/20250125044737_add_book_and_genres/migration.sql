-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "published" TIMESTAMP(3) NOT NULL,
    "firstAquistion" TIMESTAMP(3) NOT NULL,
    "latestAquistion" TIMESTAMP(3) NOT NULL,
    "isbn" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
    "numberOfPages" INTEGER NOT NULL,
    "shelfLocation" TEXT NOT NULL,
    "callNo" TEXT NOT NULL,
    "barCode" TEXT NOT NULL,
    "ddcCode" TEXT,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "genres_bookId_key" ON "genres"("bookId");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genres" ADD CONSTRAINT "genres_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
