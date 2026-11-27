// Client for BoostApp's (lee.co.il) REST API - see https://docs.lee.co.il/boostapp.
// Auth is two required headers (p-api-key, b-api-key); every response is
// { success, message, data }, and the HTTP status carries the real outcome.

interface BoostEnvelope<T> {
  success: boolean
  message: string
  data: T
}

function requireEnv(): { baseUrl: string; pApiKey: string; bApiKey: string } {
  const baseUrl = process.env.BOOSTAPP_API_URL || 'https://rest.lee.co.il'
  const pApiKey = process.env.BOOSTAPP_P_API_KEY
  const bApiKey = process.env.BOOSTAPP_B_API_KEY
  if (!pApiKey || !bApiKey) {
    throw new Error('חסרים משתני סביבה: BOOSTAPP_P_API_KEY / BOOSTAPP_B_API_KEY')
  }
  return { baseUrl, pApiKey, bApiKey }
}

async function boostFetch<T>(path: string): Promise<T> {
  const { baseUrl, pApiKey, bApiKey } = requireEnv()
  const headers = { 'p-api-key': pApiKey, 'b-api-key': bApiKey }

  let res = await fetch(`${baseUrl}${path}`, { headers })
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After')) || 5
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    res = await fetch(`${baseUrl}${path}`, { headers })
  }
  if (!res.ok) {
    throw new Error(`BoostApp החזיר ${res.status} עבור ${path}`)
  }
  const body: BoostEnvelope<T> = await res.json()
  if (!body.success) {
    throw new Error(body.message || 'BoostApp request failed')
  }
  return body.data
}

interface BoostCustomer {
  clientInformation: { id: number; name: string; phone: string | null; status: string }
}

export async function findCustomerByPhone(
  phone: string
): Promise<{ id: number; name: string } | null> {
  const data = await boostFetch<{ customers: BoostCustomer[] }>(
    `/api/customers?status=all&phone=${encodeURIComponent(phone)}`
  )
  const first = data.customers[0]
  if (!first) return null
  return { id: first.clientInformation.id, name: first.clientInformation.name }
}

export async function hasActiveSubscription(customerId: number): Promise<boolean> {
  const data = await boostFetch<{ subscriptions: unknown[] }>(
    `/api/customers/${customerId}/subscriptions?status=active`
  )
  return data.subscriptions.length > 0
}
