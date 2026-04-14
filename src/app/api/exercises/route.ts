import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const exercises = await prisma.exercise.findMany({
    include: { benchmarks: { orderBy: { levelOrder: 'asc' } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(exercises)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, notes, youtubeUrl, benchmarks } = body

  const exercise = await prisma.exercise.create({
    data: {
      name,
      notes: notes || null,
      youtubeUrl: youtubeUrl || null,
      benchmarks: {
        create: (benchmarks || []).map(
          (b: { label: string; minWeight: number; levelOrder: number }) => ({
            label: b.label,
            minWeight: Number(b.minWeight),
            levelOrder: Number(b.levelOrder),
          })
        ),
      },
    },
    include: { benchmarks: { orderBy: { levelOrder: 'asc' } } },
  })

  return NextResponse.json(exercise, { status: 201 })
}
