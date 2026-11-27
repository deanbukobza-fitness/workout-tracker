import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { ageFromBirthDate } from '@/lib/date-utils'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const birthDate = body.birthDate === null ? null : new Date(body.birthDate)
  if (birthDate !== null) {
    if (Number.isNaN(birthDate.getTime())) {
      return NextResponse.json({ error: 'תאריך לא תקין' }, { status: 400 })
    }
    const age = ageFromBirthDate(birthDate)
    if (age < 5 || age > 120) {
      return NextResponse.json({ error: 'תאריך לידה לא תקין' }, { status: 400 })
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { birthDate },
    select: { birthDate: true },
  })

  return NextResponse.json(user)
}
