/*
  Warnings:

  - You are about to drop the `FavoriteBook` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavoriteBook" DROP CONSTRAINT "FavoriteBook_bookId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteBook" DROP CONSTRAINT "FavoriteBook_memberId_fkey";

-- DropTable
DROP TABLE "FavoriteBook";

-- CreateTable
CREATE TABLE "favoriteBooks" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoriteBooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favoriteBooks_memberId_bookId_key" ON "favoriteBooks"("memberId", "bookId");

-- AddForeignKey
ALTER TABLE "favoriteBooks" ADD CONSTRAINT "favoriteBooks_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoriteBooks" ADD CONSTRAINT "favoriteBooks_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
