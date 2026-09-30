import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { exerciseId, athleteId } = body

  let userId = session.user.id
  if (athleteId && athleteId !== session.user.id) {
    if (session.user.role !== 'KIOSK' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const athlete = await prisma.user.findUnique({ where: { id: athleteId } })
    if (!athlete || athlete.role !== 'ATHLETE') {
      return NextResponse.json({ error: 'Invalid athlete' }, { status: 400 })
    }
    userId = athleteId
  }

  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId,
      exerciseId,
      source: userId === session.user.id ? 'SELF' : 'KIOSK',
    },
    include: { exercise: true },
  })

  return NextResponse.json(workoutSession, { status: 201 })
}
