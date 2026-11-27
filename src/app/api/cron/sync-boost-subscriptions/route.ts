import { NextRequest, NextResponse } from 'next/server'
import { runBoostSync } from '@/lib/sync-boost-subscriptions'

// Nightly automatic refresh of every athlete's BoostApp subscription status,
// same shared-secret auth as the key-exercise cron route.
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runBoostSync()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }
}
