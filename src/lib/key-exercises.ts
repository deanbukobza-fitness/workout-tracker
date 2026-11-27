import { prisma } from '@/lib/prisma'
import { currentMonthKey, todayDateOnly } from '@/lib/date-utils'
import type { Exercise } from '@/generated/prisma/client'

export interface KeyExerciseSlot {
  slot: number
  exercise: Exercise
}

// Today's 2 key exercises when a daily sync (from the workout-builder plan
// calendar) has run for today; otherwise falls back to this month's 4 slots,
// picked manually by an admin. Used by both the dashboard and the exercise
// picker so "what's key today" agrees everywhere.
export async function getTodaysKeyExercises(): Promise<KeyExerciseSlot[]> {
  const daily = await prisma.dailyKeyExercise.findMany({
    where: { date: todayDateOnly() },
    include: { exercise: true },
    orderBy: { slot: 'asc' },
  })
  if (daily.length > 0) return daily

  return prisma.monthlyKeyExercise.findMany({
    where: { monthKey: currentMonthKey() },
    include: { exercise: true },
    orderBy: { slot: 'asc' },
  })
}
