import { NextRequest, NextResponse } from 'next/server'
import { getSession, AppSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

function canActOn(session: AppSession, ownerId: string) {
  return ownerId === session.user.id || session.user.role === 'KIOSK' || session.user.role === 'ADMIN'
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id },
    include: {
      sets: { orderBy: { setNumber: 'asc' } },
      exercise: { include: { benchmarks: { orderBy: { levelOrder: 'asc' } } } },
    },
  })

  if (!workoutSession || !canActOn(session, workoutSession.userId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(workoutSession)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const workoutSession = await prisma.workoutSession.findUnique({ where: { id } })

  if (!workoutSession || !canActOn(session, workoutSession.userId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.workoutSession.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
