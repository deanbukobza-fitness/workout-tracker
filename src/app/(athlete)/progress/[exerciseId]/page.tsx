import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { bestEpley } from '@/lib/calculations'
import { assignLevel, computeDistribution } from '@/lib/level-utils'
import LevelIndicator from '@/components/progress/LevelIndicator'
import ProgressCharts from '@/components/progress/ProgressCharts'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Params = { params: Promise<{ exerciseId: string }> }

export default async function ExerciseProgressPage({ params }: Params) {
  const session = await auth()
  if (!session) redirect('/login')

  const { exerciseId } = await params

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { benchmarks: { orderBy: { levelOrder: 'asc' } } },
  })
  if (!exercise) redirect('/progress')

  // My sessions
  const mySessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id, exerciseId },
    include: { sets: { orderBy: { setNumber: 'asc' } } },
    orderBy: { loggedAt: 'asc' },
  })

  const myBest1RM = mySessions.length > 0 ? Math.max(...mySessions.map((s) => s.estimated1RM)) : 0
  const myLevel = assignLevel(myBest1RM, exercise.benchmarks)

  // Studio distribution
  const allAthletesSessions = await prisma.workoutSession.groupBy({
    by: ['userId'],
    where: { exerciseId },
    _max: { estimated1RM: true },
  })
  const athleteBest1RMs = allAthletesSessions.map((a) => a._max.estimated1RM ?? 0)
  const distribution = computeDistribution(athleteBest1RMs, exercise.benchmarks)

  const sessionData = mySessions.map((s) => ({
    id: s.id,
    loggedAt: s.loggedAt.toISOString(),
    totalVolume: s.totalVolume,
    estimated1RM: s.estimated1RM,
    isVolumePR: s.isVolumePR,
  }))

  return (
    <div className="p-4 space-y-5 max-w-xl mx-auto">
      <Link
        href="/progress"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground pt-2"
      >
        <ChevronRight size={16} />
        חזרה
      </Link>

      <h1 className="text-2xl font-bold">{exercise.name}</h1>

      {/* Level indicator */}
      <LevelIndicator
        myLevel={myLevel}
        myBest1RM={myBest1RM}
        distribution={distribution}
        totalStudioAthletes={athleteBest1RMs.length}
      />

      {/* Charts */}
      <div className="rounded-xl border border-border p-4 bg-card">
        <h3 className="font-bold text-lg mb-4">גרף התקדמות</h3>
        <ProgressCharts sessions={sessionData} />
      </div>

      {/* Link to log this exercise */}
      <Link
        href={`/log/${exerciseId}`}
        className="block w-full text-center rounded-lg bg-pink-600 hover:bg-pink-700 text-white py-3 font-bold transition-colors"
      >
        אמני עכשיו
      </Link>
    </div>
  )
}
