import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { runBoostSync } from '@/lib/sync-boost-subscriptions'

export async function POST() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const result = await runBoostSync()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }
}
