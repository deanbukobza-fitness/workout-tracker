-- CreateTable
CREATE TABLE "DailyKeyExercise" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "slot" INTEGER NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyKeyExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyKeyExercise_date_idx" ON "DailyKeyExercise"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyKeyExercise_date_slot_key" ON "DailyKeyExercise"("date", "slot");

-- AddForeignKey
ALTER TABLE "DailyKeyExercise" ADD CONSTRAINT "DailyKeyExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
