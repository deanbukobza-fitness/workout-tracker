import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'
import ResetPasswordButton from './ResetPasswordButton'
import EditPhoneButton from './EditPhoneButton'
import SyncBoostButton from './SyncBoostButton'

export default async function AdminAthletesPage() {
  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const athletes = await prisma.user.findMany({
    where: { role: 'ATHLETE' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      boostCustomerId: true,
      boostSubscriptionActive: true,
      boostSubscriptionCheckedAt: true,
      workoutSessions: {
        orderBy: { loggedAt: 'desc' },
        take: 1,
        select: { loggedAt: true },
      },
      _count: { select: { workoutSessions: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">מתאמנות ({athletes.length})</h1>

      <SyncBoostButton />

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-start p-3 font-medium">שם</th>
              <th className="text-start p-3 font-medium hidden md:table-cell">מייל</th>
              <th className="text-center p-3 font-medium">אימונים</th>
              <th className="text-start p-3 font-medium">אימון אחרון</th>
              <th className="text-center p-3 font-medium">סטטוס</th>
              <th className="text-center p-3 font-medium">מנוי</th>
              <th className="text-center p-3 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {athletes.map((a) => {
              const last = a.workoutSessions[0]?.loggedAt
              let status: 'active' | 'inactive' | 'new' = 'new'
              if (last) {
                status = last >= fourteenDaysAgo ? 'active' : 'inactive'
              }

              let subscriptionBadge
              if (!a.phone) {
                subscriptionBadge = (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">אין טלפון</Badge>
                )
              } else if (!a.boostSubscriptionCheckedAt) {
                subscriptionBadge = (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">טרם נבדק</Badge>
                )
              } else if (!a.boostCustomerId) {
                subscriptionBadge = (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">לא נמצאה ב-Boost</Badge>
                )
              } else if (a.boostSubscriptionActive) {
                subscriptionBadge = (
                  <Badge className="bg-green-100 text-green-700 border-green-200">מנוי פעיל</Badge>
                )
              } else {
                subscriptionBadge = (
                  <Badge className="bg-red-100 text-red-700 border-red-200">אין מנוי פעיל</Badge>
                )
              }

              return (
                <tr key={a.id} className="hover:bg-muted/50">
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{a.email}</td>
                  <td className="p-3 text-center">{a._count.workoutSessions}</td>
                  <td className="p-3 text-muted-foreground">
                    {last ? formatDate(last) : 'ללא אימונים'}
                  </td>
                  <td className="p-3 text-center">
                    {status === 'active' && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">פעילה</Badge>
                    )}
                    {status === 'inactive' && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">לא פעילה</Badge>
                    )}
                    {status === 'new' && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">חדשה</Badge>
                    )}
                  </td>
                  <td className="p-3 text-center">{subscriptionBadge}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <EditPhoneButton athleteId={a.id} currentPhone={a.phone} />
                      <ResetPasswordButton athleteId={a.id} athleteName={a.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
