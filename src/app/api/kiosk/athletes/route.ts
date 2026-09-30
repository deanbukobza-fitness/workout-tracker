import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || (session.user.role !== 'KIOSK' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const athletes = await prisma.user.findMany({
    where: { role: 'ATHLETE' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(athletes)
}
