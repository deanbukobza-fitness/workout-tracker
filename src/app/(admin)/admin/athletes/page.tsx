import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'

export default async function AdminAthletesPage() {
  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const athletes = await prisma.user.findMany({
    where: { role: 'ATHLETE' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
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
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">מתאמנות ({athletes.length})</h1>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-start p-3 font-medium">שם</th>
              <th className="text-start p-3 font-medium hidden md:table-cell">מייל</th>
              <th className="text-center p-3 font-medium">אימונים</th>
              <th className="text-start p-3 font-medium">אימון אחרון</th>
              <th className="text-center p-3 font-medium">סטטוס</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {athletes.map((a) => {
              const last = a.workoutSessions[0]?.loggedAt
              let status: 'active' | 'inactive' | 'new' = 'new'
              if (last) {
                status = last >= fourteenDaysAgo ? 'active' : 'inactive'
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
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
