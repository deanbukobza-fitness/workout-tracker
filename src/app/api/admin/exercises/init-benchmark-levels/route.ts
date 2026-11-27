import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// Fixed, studio-wide levels - the 5th strengthlevel.com tier (Elite) is
// dropped on purpose, it's too far from what's relevant for studio athletes
const LEVEL_LABELS = ['מתאמנת', 'מבינה עניין', 'מתקדמת', 'מקצוענית']

export async function POST() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const exercises = await prisma.exercise.findMany({
    where: { isActive: true },
    select: { id: true },
  })

  let exercisesProcessed = 0
  for (const ex of exercises) {
    await prisma.$transaction([
      prisma.benchmark.deleteMany({ where: { exerciseId: ex.id, levelOrder: { gte: 5 } } }),
      ...LEVEL_LABELS.map((label, i) =>
        prisma.benchmark.upsert({
          where: { exerciseId_levelOrder: { exerciseId: ex.id, levelOrder: i + 1 } },
          update: { label },
          create: { exerciseId: ex.id, label, minWeight: 0, levelOrder: i + 1 },
        })
      ),
    ])
    exercisesProcessed++
  }

  return NextResponse.json({ exercisesProcessed })
}
