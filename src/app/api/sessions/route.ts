import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { exerciseId } = body

  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      exerciseId,
    },
    include: { exercise: true },
  })

  return NextResponse.json(workoutSession, { status: 201 })
}
