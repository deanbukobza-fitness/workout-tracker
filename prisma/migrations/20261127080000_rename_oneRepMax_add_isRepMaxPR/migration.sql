-- Rename: WorkoutSet.epley1RM no longer holds an Epley estimate (switched to
-- Brzycki, matching strengthlevel.com's own calculator)
ALTER TABLE "WorkoutSet" RENAME COLUMN "epley1RM" TO "oneRepMax";

-- AlterTable
ALTER TABLE "WorkoutSession" ADD COLUMN     "isRepMaxPR" BOOLEAN NOT NULL DEFAULT false;
