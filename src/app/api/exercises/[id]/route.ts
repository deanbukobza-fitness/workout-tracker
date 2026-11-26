import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { benchmarks: { orderBy: { levelOrder: 'asc' } } },
  })
  if (!exercise) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exercise)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, notes, youtubeUrl, benchmarks } = body
  const incoming = (benchmarks || []) as { label: string; minWeight: number; levelOrder: number }[]

  // Upsert benchmarks by (exerciseId, levelOrder) rather than delete+recreate,
  // so a benchmark's id - and any bodyweight-curve points cascaded from it -
  // survives a plain name/notes edit
  const incomingLevelOrders = incoming.map((b) => Number(b.levelOrder))
  await prisma.benchmark.deleteMany({
    where: { exerciseId: id, levelOrder: { notIn: incomingLevelOrders } },
  })
  await Promise.all(
    incoming.map((b) =>
      prisma.benchmark.upsert({
        where: { exerciseId_levelOrder: { exerciseId: id, levelOrder: Number(b.levelOrder) } },
        update: { label: b.label, minWeight: Number(b.minWeight) },
        create: {
          exerciseId: id,
          label: b.label,
          minWeight: Number(b.minWeight),
          levelOrder: Number(b.levelOrder),
        },
      })
    )
  )

  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      name,
      notes: notes || null,
      youtubeUrl: youtubeUrl || null,
    },
    include: { benchmarks: { orderBy: { levelOrder: 'asc' } } },
  })

  return NextResponse.json(exercise)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await prisma.exercise.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
