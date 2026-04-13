import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/date-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [recentPRs, athletes] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { isVolumePR: true, loggedAt: { gte: sevenDaysAgo } },
      include: {
        user: { select: { name: true } },
        exercise: { select: { name: true } },
      },
      orderBy: { loggedAt: 'desc' },
      take: 10,
    }),
    prisma.user.findMany({
      where: { role: 'ATHLETE' },
      select: {
        id: true,
        name: true,
        email: true,
        workoutSessions: {
          orderBy: { loggedAt: 'desc' },
          take: 1,
          select: { loggedAt: true },
        },
      },
    }),
  ])

  const activeCount = athletes.filter(
    (a) => a.workoutSessions[0]?.loggedAt && a.workoutSessions[0].loggedAt >= fourteenDaysAgo
  ).length
  const inactiveCount = athletes.filter(
    (a) => a.workoutSessions[0]?.loggedAt && a.workoutSessions[0].loggedAt < fourteenDaysAgo
  ).length
  const newCount = athletes.filter((a) => !a.workoutSessions[0]).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">לוח בקרה</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users size={24} className="mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{athletes.length}</div>
            <div className="text-xs text-muted-foreground">סה״כ מתאמנות</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck size={24} className="mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <div className="text-xs text-muted-foreground">פעילות (14 יום)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserX size={24} className="mx-auto mb-1 text-red-400" />
            <div className="text-2xl font-bold text-red-500">{inactiveCount}</div>
            <div className="text-xs text-muted-foreground">לא פעילות</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy size={24} className="mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold text-amber-600">{recentPRs.length}</div>
            <div className="text-xs text-muted-foreground">שיאים (7 ימים)</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent PRs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            שיאים אחרונים (7 ימים)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPRs.length === 0 ? (
            <p className="text-muted-foreground text-sm">אין שיאים חדשים בשבוע האחרון</p>
          ) : (
            <div className="space-y-2">
              {recentPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 p-3"
                >
                  <div>
                    <div className="font-medium text-sm">{pr.user.name}</div>
                    <div className="text-xs text-muted-foreground">{pr.exercise.name}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-amber-600">
                      {pr.totalVolume.toFixed(0)} ק״ג
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(pr.loggedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive athletes */}
      {inactiveCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <UserX size={18} />
              מתאמנות לא פעילות (&gt;14 יום)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {athletes
                .filter(
                  (a) =>
                    a.workoutSessions[0]?.loggedAt &&
                    a.workoutSessions[0].loggedAt < fourteenDaysAgo
                )
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <div className="font-medium text-sm">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.workoutSessions[0]
                        ? `אחרון: ${formatDate(a.workoutSessions[0].loggedAt)}`
                        : 'ללא אימונים'}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
