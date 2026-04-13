import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { currentMonthKey, hebrewMonthLabel, formatDate } from '@/lib/date-utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const monthKey = currentMonthKey()

  // Key exercises for this month
  const keyExercises = await prisma.monthlyKeyExercise.findMany({
    where: { monthKey },
    include: { exercise: true },
    orderBy: { slot: 'asc' },
  })

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

      {/* Key exercises */}
      <section>
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          🔑 תרגילי המפתח החודש
        </h2>
        {keyExercises.length === 0 ? (
          <p className="text-muted-foreground text-sm">לא הוגדרו תרגילי מפתח לחודש זה</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {keyExercises.map(({ slot, exercise }) => (
              <Link key={slot} href={`/log/${exercise.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-pink-200 bg-pink-50 hover:bg-pink-100">
                  <CardContent className="p-3">
                    <div className="text-xs text-pink-400 font-medium mb-1">תרגיל {slot}</div>
                    <div className="font-bold text-sm leading-tight">{exercise.name}</div>
                    <div className="mt-2 text-xs text-pink-600 font-medium">אימון עכשיו →</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
