-- CreateTable
CREATE TABLE "academicYears" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "academicYear" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "academicYears_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defaultAcademicYears" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "academicYear" TEXT NOT NULL,

    CONSTRAINT "defaultAcademicYears_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defaultSemesters" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "semesterName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "defaultSemesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "semesterName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academicYears_institutionId_isActive_idx" ON "academicYears"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "academicYears_institutionId_academicYear_key" ON "academicYears"("institutionId", "academicYear");

-- CreateIndex
CREATE INDEX "semesters_academicYearId_isActive_idx" ON "semesters"("academicYearId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_academicYearId_semesterName_key" ON "semesters"("academicYearId", "semesterName");

-- AddForeignKey
ALTER TABLE "academicYears" ADD CONSTRAINT "academicYears_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academicYears"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
