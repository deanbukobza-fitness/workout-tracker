'use server'

import { decode } from '@auth/core/jwt'
import { cookies } from 'next/headers'

export interface AppSession {
  user: {
    id: string
    name: string
    email: string
    role: 'ATHLETE' | 'ADMIN'
  }
}

export async function getSession(): Promise<AppSession | null> {
  const cookieJar = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieName = isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token'
  const sessionCookie = cookieJar.get(cookieName)

  if (!sessionCookie?.value) return null

  try {
    const token = await decode({
      token: sessionCookie.value,
      secret: process.env.AUTH_SECRET!,
      salt: cookieName,
    })

    if (!token?.sub) return null

    return {
      user: {
        id: token.id as string ?? token.sub,
        name: token.name as string,
        email: token.email as string,
        role: token.role as 'ATHLETE' | 'ADMIN',
      },
    }
  } catch {
    return null
  }
}
