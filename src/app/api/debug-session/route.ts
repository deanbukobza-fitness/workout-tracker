import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decode } from '@auth/core/jwt'

export async function GET() {
  const cookieJar = await cookies()
  const allCookies = cookieJar.getAll()
  const nodeEnv = process.env.NODE_ENV
  const secureName = '__Secure-authjs.session-token'
  const regularName = 'authjs.session-token'

  const secureCookie = cookieJar.get(secureName)
  const regularCookie = cookieJar.get(regularName)

  let decoded = null
  const cookieToTry = secureCookie || regularCookie
  if (cookieToTry) {
    const salt = secureCookie ? secureName : regularName
    try {
      decoded = await decode({
        token: cookieToTry.value,
        secret: process.env.AUTH_SECRET!,
        salt,
      })
    } catch (e: unknown) {
      decoded = { error: String(e) }
    }
  }

  return NextResponse.json({
    nodeEnv,
    cookieNames: allCookies.map((c) => c.name),
    hasSecureCookie: !!secureCookie,
    hasRegularCookie: !!regularCookie,
    decoded,
  })
}
