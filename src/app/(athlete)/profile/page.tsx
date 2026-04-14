import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/date-utils'
import { Trophy, Dumbbell, Calendar } from 'lucide-react'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [sessionCount, prCount, lastSession] = await Promise.all([
    prisma.workoutSession.count({ where: { userId: session.user.id } }),
    prisma.workoutSession.count({ where: { userId: session.user.id, isVolumePR: true } }),
    prisma.workoutSession.findFirst({
      where: { userId: session.user.id },
      orderBy: { loggedAt: 'desc' },
      select: { loggedAt: true },
    }),
  ])

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <div className="pt-4 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
          {session.user.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold">{session.user.name}</h1>
        <p className="text-muted-foreground text-sm">{session.user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Dumbbell size={20} className="mx-auto mb-1 text-pink-500" />
            <div className="text-2xl font-bold">{sessionCount}</div>
            <div className="text-xs text-muted-foreground">אימונים</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy size={20} className="mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{prCount}</div>
            <div className="text-xs text-muted-foreground">שיאים</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar size={20} className="mx-auto mb-1 text-purple-500" />
            <div className="text-sm font-bold">
              {lastSession ? formatDate(lastSession.loggedAt) : '—'}
            </div>
            <div className="text-xs text-muted-foreground">אימון אחרון</div>
          </CardContent>
        </Card>
      </div>

      {/* Sign out */}
      <form
        action={async () => {
          'use server'
          const { cookies } = await import('next/headers')
          const { redirect } = await import('next/navigation')
          const cookieJar = await cookies()
          const isProduction = process.env.NODE_ENV === 'production'
          const cookieName = isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token'
          cookieJar.delete(cookieName)
          redirect('/login')
        }}
      >
        <Button variant="outline" className="w-full" type="submit">
          התנתקות
        </Button>
      </form>
    </div>
  )
}
