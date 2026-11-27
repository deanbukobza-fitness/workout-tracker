import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { assignLevel, computeDistribution } from '@/lib/level-utils'
import { ageFromBirthDate } from '@/lib/date-utils'
import LevelIndicator from '@/components/progress/LevelIndicator'
import ProgressCharts from '@/components/progress/ProgressCharts'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Params = { params: Promise<{ exerciseId: string }> }

export default async function ExerciseProgressPage({ params }: Params) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { exerciseId } = await params

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      benchmarks: { orderBy: { levelOrder: 'asc' }, include: { points: true, agePoints: true } },
    },
  })
  if (!exercise) redirect('/progress')

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bodyweightKg: true, birthDate: true },
  })
  const myAge = me?.birthDate ? ageFromBirthDate(me.birthDate) : null

  // My sessions
  const mySessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id, exerciseId },
    include: { sets: { orderBy: { setNumber: 'asc' } } },
    orderBy: { loggedAt: 'asc' },
  })

  const myBest1RM = mySessions.length > 0 ? Math.max(...mySessions.map((s) => s.estimated1RM)) : 0
  const myLevel = assignLevel(myBest1RM, exercise.benchmarks, me?.bodyweightKg, myAge)

  // Studio distribution
  const allAthletesSessions = await prisma.workoutSession.groupBy({
    by: ['userId'],
    where: { exerciseId },
    _max: { estimated1RM: true },
  })
  const athleteUsers = await prisma.user.findMany({
    where: { id: { in: allAthletesSessions.map((a) => a.userId) } },
    select: { id: true, bodyweightKg: true, birthDate: true },
  })
  const athleteById = new Map(athleteUsers.map((u) => [u.id, u]))
  const athletes = allAthletesSessions.map((a) => {
    const athlete = athleteById.get(a.userId)
    return {
      best1RM: a._max.estimated1RM ?? 0,
      bodyweightKg: athlete?.bodyweightKg,
      ageYears: athlete?.birthDate ? ageFromBirthDate(athlete.birthDate) : null,
    }
  })
  const distribution = computeDistribution(athletes, exercise.benchmarks)

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
        totalStudioAthletes={athletes.length}
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
