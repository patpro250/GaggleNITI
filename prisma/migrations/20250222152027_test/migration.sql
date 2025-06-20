/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `librarians` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[directorId]` on the table `libraries` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "librarians" DROP CONSTRAINT "librarians_librarianId_fkey";

-- CreateTable
CREATE TABLE "_LibraryLibrarians" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LibraryLibrarians_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LibraryLibrarians_B_index" ON "_LibraryLibrarians"("B");

-- CreateIndex
CREATE UNIQUE INDEX "librarians_email_key" ON "librarians"("email");

-- CreateIndex
CREATE UNIQUE INDEX "libraries_directorId_key" ON "libraries"("directorId");

-- AddForeignKey
ALTER TABLE "_LibraryLibrarians" ADD CONSTRAINT "_LibraryLibrarians_A_fkey" FOREIGN KEY ("A") REFERENCES "librarians"("librarianId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryLibrarians" ADD CONSTRAINT "_LibraryLibrarians_B_fkey" FOREIGN KEY ("B") REFERENCES "libraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
