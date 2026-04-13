import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bestEpley } from '@/lib/calculations'
import { assignLevel, computeDistribution } from '@/lib/level-utils'

type Params = { params: Promise<{ exerciseId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { exerciseId } = await params

  // Fetch exercise with benchmarks
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { benchmarks: { orderBy: { levelOrder: 'asc' } } },
  })
  if (!exercise) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fetch athlete's session history (most recent first)
  const mySessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id, exerciseId },
    include: { sets: { orderBy: { setNumber: 'asc' } } },
    orderBy: { loggedAt: 'asc' },
  })

  // My best 1RM
  const myBest1RM =
    mySessions.length > 0 ? Math.max(...mySessions.map((s) => s.estimated1RM)) : 0

  // Studio-wide: fetch best 1RM per athlete who has logged this exercise
  const allAthletesSessions = await prisma.workoutSession.groupBy({
    by: ['userId'],
    where: { exerciseId },
    _max: { estimated1RM: true },
  })
  const athleteBest1RMs = allAthletesSessions.map((a) => a._max.estimated1RM ?? 0)

  // Compute level distribution
  const distribution = computeDistribution(athleteBest1RMs, exercise.benchmarks)

  // My current level
  const myLevel = assignLevel(myBest1RM, exercise.benchmarks)

  return NextResponse.json({
    exercise,
    sessions: mySessions.map((s) => ({
      id: s.id,
      loggedAt: s.loggedAt,
      totalVolume: s.totalVolume,
      estimated1RM: s.estimated1RM,
      isVolumePR: s.isVolumePR,
      sets: s.sets,
    })),
    myBest1RM,
    myLevel,
    distribution,
    totalStudioAthletes: athleteBest1RMs.length,
  })
}
