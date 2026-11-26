-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bodyweightKg" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "BenchmarkPoint" (
    "id" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "bodyweightKg" DOUBLE PRECISION NOT NULL,
    "minWeight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BenchmarkPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BenchmarkPoint_benchmarkId_idx" ON "BenchmarkPoint"("benchmarkId");

-- CreateIndex
CREATE UNIQUE INDEX "BenchmarkPoint_benchmarkId_bodyweightKg_key" ON "BenchmarkPoint"("benchmarkId", "bodyweightKg");

-- AddForeignKey
ALTER TABLE "BenchmarkPoint" ADD CONSTRAINT "BenchmarkPoint_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "Benchmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;
