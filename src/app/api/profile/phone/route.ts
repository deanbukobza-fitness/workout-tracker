import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { normalizePhone } from '@/lib/phone-utils'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const phone = body.phone === null ? null : normalizePhone(String(body.phone))
  if (body.phone !== null && !phone) {
    return NextResponse.json({ error: 'מספר טלפון לא תקין' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { phone },
    select: { phone: true },
  })

  return NextResponse.json(user)
}
