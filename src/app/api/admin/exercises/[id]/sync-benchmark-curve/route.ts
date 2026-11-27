import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { fetchFemaleBodyweightBrackets } from '@/lib/strengthlevel'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const slug = String(body.slug || '').trim()
  if (!slug) return NextResponse.json({ error: 'יש להזין slug' }, { status: 400 })

  const benchmarks = await prisma.benchmark.findMany({
    where: { exerciseId: id },
    orderBy: { levelOrder: 'asc' },
  })
  if (benchmarks.length !== 4) {
    return NextResponse.json(
      {
        error:
          'יש להגדיר קודם 4 רמות (Benchmarks) לתרגיל הזה - אפשר ללחוץ על "אתחול רמות" בעמוד רשימת התרגילים',
      },
      { status: 400 }
    )
  }

  let brackets
  try {
    brackets = await fetchFemaleBodyweightBrackets(slug)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }

  // strengthlevel.com has 5 tiers (Beginner..Elite); only the first 4 are used -
  // Elite is intentionally dropped as irrelevant for studio athletes. The flat
  // minWeight (fallback for an athlete with no bodyweight entered) is set from
  // the middle bodyweight bracket.
  const reference = brackets[Math.floor((brackets.length - 1) / 2)]

  await prisma.$transaction(
    benchmarks.flatMap((b, i) => [
      prisma.benchmark.update({ where: { id: b.id }, data: { minWeight: reference.levels[i] } }),
      prisma.benchmarkPoint.deleteMany({ where: { benchmarkId: b.id } }),
      prisma.benchmarkPoint.createMany({
        data: brackets.map((br) => ({
          benchmarkId: b.id,
          bodyweightKg: br.bodyweightKg,
          minWeight: br.levels[i],
        })),
      }),
    ])
  )

  return NextResponse.json({
    synced: true,
    bracketCount: brackets.length,
    bodyweightRange: [brackets[0].bodyweightKg, brackets[brackets.length - 1].bodyweightKg],
  })
}
