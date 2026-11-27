import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { runDailySync } from '@/lib/sync-daily-exercises'

export async function POST() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result = await runDailySync()
  return NextResponse.json(result.body, { status: result.status })
}
