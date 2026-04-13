import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { currentMonthKey } from '@/lib/date-utils'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const monthKey = searchParams.get('month') || currentMonthKey()

  const slots = await prisma.monthlyKeyExercise.findMany({
    where: { monthKey },
    include: { exercise: { include: { benchmarks: { orderBy: { levelOrder: 'asc' } } } } },
    orderBy: { slot: 'asc' },
  })

  return NextResponse.json(slots)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { monthKey, slots } = body
  // slots: Array<{ slot: number; exerciseId: string }>

  // Delete existing slots for this month and re-create
  await prisma.monthlyKeyExercise.deleteMany({ where: { monthKey } })

  const created = await prisma.monthlyKeyExercise.createMany({
    data: (slots as { slot: number; exerciseId: string }[]).map((s) => ({
      monthKey,
      slot: s.slot,
      exerciseId: s.exerciseId,
    })),
  })

  return NextResponse.json({ count: created.count })
}
