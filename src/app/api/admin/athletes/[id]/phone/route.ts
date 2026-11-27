import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { normalizePhone } from '@/lib/phone-utils'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const phone = body.phone === null ? null : normalizePhone(String(body.phone))
  if (body.phone !== null && !phone) {
    return NextResponse.json({ error: 'מספר טלפון לא תקין' }, { status: 400 })
  }

  // Changing the phone invalidates any previous BoostApp match - the next
  // sync will re-resolve it
  const user = await prisma.user.update({
    where: { id },
    data: { phone, boostCustomerId: null, boostSubscriptionActive: null, boostSubscriptionCheckedAt: null },
    select: { phone: true },
  })

  return NextResponse.json(user)
}
