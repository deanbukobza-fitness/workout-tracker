import { NextRequest, NextResponse } from 'next/server'
import { runDailySync } from '@/lib/sync-daily-exercises'

// Nightly automatic run of the same sync the admin's "סנכרן עכשיו" button
// triggers, so today's 2 key exercises are ready without anyone remembering
// to click it. Scheduled via vercel.json; authenticated by a shared secret
// (Vercel Cron requests carry it automatically) instead of an admin session.
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runDailySync()
  return NextResponse.json(result.body, { status: result.status })
}
