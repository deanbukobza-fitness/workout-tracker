-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BenchmarkAgePoint" (
    "id" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "ageYears" INTEGER NOT NULL,
    "minWeight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BenchmarkAgePoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BenchmarkAgePoint_benchmarkId_idx" ON "BenchmarkAgePoint"("benchmarkId");

-- CreateIndex
CREATE UNIQUE INDEX "BenchmarkAgePoint_benchmarkId_ageYears_key" ON "BenchmarkAgePoint"("benchmarkId", "ageYears");

-- AddForeignKey
ALTER TABLE "BenchmarkAgePoint" ADD CONSTRAINT "BenchmarkAgePoint_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "Benchmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;
