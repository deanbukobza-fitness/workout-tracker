import { prisma } from '@/lib/prisma'
import { findCustomerByPhone, hasActiveSubscription } from '@/lib/boostapp'

const DELAY_BETWEEN_ATHLETES_MS = 300

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export interface BoostSyncResult {
  checked: number
  matched: number
  failed: number
}

// For every athlete with a phone on file: resolve her BoostApp customer id
// (once, then cached) and refresh whether she currently has an active
// subscription. Sequential with a small delay between athletes - simple and
// friendly to BoostApp's rate limit for a studio-sized athlete list; one
// athlete's failure doesn't stop the rest.
export async function runBoostSync(): Promise<BoostSyncResult> {
  const athletes = await prisma.user.findMany({
    where: { role: 'ATHLETE', phone: { not: null } },
    select: { id: true, phone: true, boostCustomerId: true },
  })

  let matched = 0
  let failed = 0

  for (const athlete of athletes) {
    try {
      let customerId = athlete.boostCustomerId
      if (!customerId) {
        const found = await findCustomerByPhone(athlete.phone!)
        customerId = found?.id ?? null
        if (customerId) {
          await prisma.user.update({ where: { id: athlete.id }, data: { boostCustomerId: customerId } })
        }
      }

      if (customerId) {
        const active = await hasActiveSubscription(customerId)
        await prisma.user.update({
          where: { id: athlete.id },
          data: { boostSubscriptionActive: active, boostSubscriptionCheckedAt: new Date() },
        })
        matched++
      } else {
        await prisma.user.update({
          where: { id: athlete.id },
          data: { boostSubscriptionActive: null, boostSubscriptionCheckedAt: new Date() },
        })
      }
    } catch {
      failed++
    }
    await sleep(DELAY_BETWEEN_ATHLETES_MS)
  }

  return { checked: athletes.length, matched, failed }
}
