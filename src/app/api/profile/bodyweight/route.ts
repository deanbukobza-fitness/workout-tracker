import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const bodyweightKg = body.bodyweightKg === null ? null : Number(body.bodyweightKg)
  if (bodyweightKg !== null && (!Number.isFinite(bodyweightKg) || bodyweightKg <= 0 || bodyweightKg > 300)) {
    return NextResponse.json({ error: 'משקל לא תקין' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { bodyweightKg },
    select: { bodyweightKg: true },
  })

  return NextResponse.json(user)
}
