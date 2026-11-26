import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

async function loginToWorkoutBuilder(baseUrl: string, email: string, password: string) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  })
  if (!res.ok) {
    throw new Error(`התחברות ל-workout-builder נכשלה (${res.status})`)
  }
  const data = await res.json()
  return data.access_token as string
}

export async function GET() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const baseUrl = process.env.WORKOUT_BUILDER_API_URL
  const email = process.env.WORKOUT_BUILDER_SYNC_EMAIL
  const password = process.env.WORKOUT_BUILDER_SYNC_PASSWORD
  if (!baseUrl || !email || !password) {
    return NextResponse.json(
      { error: 'חסרים משתני סביבה: WORKOUT_BUILDER_API_URL / _SYNC_EMAIL / _SYNC_PASSWORD' },
      { status: 500 }
    )
  }

  let token: string
  try {
    token = await loginToWorkoutBuilder(baseUrl, email, password)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }

  const res = await fetch(`${baseUrl}/libraries`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    return NextResponse.json(
      { error: `שליפת רשימת המאגרים מ-workout-builder נכשלה (${res.status})` },
      { status: 502 }
    )
  }
  const libraries = await res.json()
  return NextResponse.json(libraries)
}
