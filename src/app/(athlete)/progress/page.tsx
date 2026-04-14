import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BarChart2 } from 'lucide-react'

export default async function ProgressPage() {
  const session = await getSession()
  if (!session) return null

  // Find all exercises the athlete has logged
  const logged = await prisma.workoutSession.groupBy({
    by: ['exerciseId'],
    where: { userId: session.user.id },
    _count: { id: true },
    _max: { loggedAt: true, estimated1RM: true, totalVolume: true },
  })

  const exerciseIds = logged.map((l) => l.exerciseId)
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, name: true },
  })
  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]))

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold pt-2">התקדמות שלי</h1>

      {logged.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>עוד לא הזנת אימונים.</p>
          <Link href="/log" className="mt-2 inline-block text-sm text-primary hover:underline">
            התחלי אימון ראשון
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {logged.map((l) => {
            const ex = exerciseMap[l.exerciseId]
            if (!ex) return null
            return (
              <Link
                key={l.exerciseId}
                href={`/progress/${l.exerciseId}`}
                className="block rounded-lg border border-border bg-card p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{ex.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {l._count.id} אימונים
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">
                      {(l._max.estimated1RM ?? 0).toFixed(1)} ק״ג 1RM
                    </div>
                    <div className="text-xs text-muted-foreground">הטוב ביותר</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
