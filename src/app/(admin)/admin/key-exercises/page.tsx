import { prisma } from '@/lib/prisma'
import { currentMonthKey, hebrewMonthLabel } from '@/lib/date-utils'
import KeyExercisePicker from './KeyExercisePicker'

export default async function KeyExercisesPage() {
  const monthKey = currentMonthKey()

  const [exercises, currentSlots] = await Promise.all([
    prisma.exercise.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.monthlyKeyExercise.findMany({
      where: { monthKey },
      orderBy: { slot: 'asc' },
      include: { exercise: { select: { id: true, name: true } } },
    }),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">תרגילי מפתח חודשיים</h1>
        <p className="text-muted-foreground text-sm mt-1">{hebrewMonthLabel(monthKey)}</p>
      </div>

      <KeyExercisePicker
        monthKey={monthKey}
        exercises={exercises}
        initialSlots={currentSlots.map((s) => ({
          slot: s.slot,
          exerciseId: s.exercise.id,
          exerciseName: s.exercise.name,
        }))}
      />
    </div>
  )
}
