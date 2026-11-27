import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { currentMonthKey, hebrewMonthLabel, formatDate } from '@/lib/date-utils'
import { getTodaysKeyExercises } from '@/lib/key-exercises'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const monthKey = currentMonthKey()
  const keyExercises = await getTodaysKeyExercises()

  // Recent sessions
  const recentSessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id },
    include: { exercise: true },
    orderBy: { loggedAt: 'desc' },
    take: 5,
  })

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="pt-2">
        <p className="text-muted-foreground text-sm">שלום 👋</p>
        <h1 className="text-2xl font-bold">{session.user.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{hebrewMonthLabel(monthKey)}</p>
      </div>

      {/* Key exercises: one big, simple button */}
      <section className="flex flex-col items-center py-2">
        {keyExercises.length === 0 ? (
          <p className="text-muted-foreground text-sm">לא הוגדרו תרגילי מפתח להיום</p>
        ) : (
          <Link href="/log/today" className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-pink-600 hover:bg-pink-700 transition-colors shadow-lg">
              <Plus size={40} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-pink-600">תרגיל היום</span>
          </Link>
        )}
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="font-bold text-lg mb-3">📋 פעילות אחרונה</h2>
        {recentSessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <div className="text-3xl mb-2">🏋️‍♀️</div>
              <p>עוד לא הזנת אימונים. בואי נתחיל!</p>
              <Link
                href="/log"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                התחלי אימון ראשון
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 bg-card"
              >
                <div>
                  <div className="font-medium text-sm">{s.exercise.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(s.loggedAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {s.isVolumePR && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                      <Trophy size={10} />
                      שיא
                    </Badge>
                  )}
                  <div className="text-sm font-medium text-muted-foreground">
                    {s.totalVolume.toFixed(0)} ק״ג
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
