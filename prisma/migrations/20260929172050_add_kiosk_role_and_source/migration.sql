-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'KIOSK';

-- CreateEnum
CREATE TYPE "WorkoutSource" AS ENUM ('SELF', 'KIOSK');

-- AlterTable
ALTER TABLE "WorkoutSession" ADD COLUMN     "source" "WorkoutSource" NOT NULL DEFAULT 'SELF';
