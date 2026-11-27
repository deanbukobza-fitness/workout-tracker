import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { todayDateOnly } from '@/lib/date-utils'
import KeyExerciseLogger from '@/components/logging/KeyExerciseLogger'

type Params = { params: Promise<{ exerciseId: string }> }

export default async function TodayKeyExercisePage({ params }: Params) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { exerciseId } = await params

  const [exercise, me] = await Promise.all([
    prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { benchmarks: { orderBy: { levelOrder: 'asc' }, include: { points: true } } },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { bodyweightKg: true } }),
  ])
  if (!exercise) redirect('/log/today')

  // Resume today's in-progress session for this exercise, if one exists,
  // instead of creating a new one every time she opens this page
  let workoutSession = await prisma.workoutSession.findFirst({
    where: { userId: session.user.id, exerciseId, loggedAt: { gte: todayDateOnly() } },
    include: { sets: { orderBy: { setNumber: 'asc' } } },
    orderBy: { loggedAt: 'desc' },
  })
  if (!workoutSession) {
    workoutSession = await prisma.workoutSession.create({
      data: { userId: session.user.id, exerciseId },
      include: { sets: { orderBy: { setNumber: 'asc' } } },
    })
  }

  return (
    <KeyExerciseLogger
      sessionId={workoutSession.id}
      exerciseName={exercise.name}
      youtubeUrl={exercise.youtubeUrl}
      benchmarks={exercise.benchmarks}
      bodyweightKg={me?.bodyweightKg ?? null}
      initialSets={workoutSession.sets.map((s) => ({
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        volume: s.volume,
      }))}
      initialEstimated1RM={workoutSession.estimated1RM}
    />
  )
}
