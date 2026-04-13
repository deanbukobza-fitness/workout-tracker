import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id },
    include: {
      exercise: { select: { id: true, name: true } },
      sets: { orderBy: { setNumber: 'asc' } },
    },
    orderBy: { loggedAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(sessions)
}
