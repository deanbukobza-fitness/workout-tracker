import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

interface WorkoutBuilderExercise {
  id: number
  name: string
  is_active: boolean
}

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

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const libraryId: number | undefined = body?.libraryId

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
  const authHeader = { Authorization: `Bearer ${token}` }

  const res = await fetch(`${baseUrl}/exercises`, { headers: authHeader })
  if (!res.ok) {
    return NextResponse.json(
      { error: `שליפת רשימת התרגילים מ-workout-builder נכשלה (${res.status})` },
      { status: 502 }
    )
  }
  const remoteExercises: WorkoutBuilderExercise[] = await res.json()

  let toImport = remoteExercises.filter((e) => e.is_active)
  // The set of ids this sync considers "in scope": everything active, unless
  // a library is chosen, in which case scope narrows to just that library -
  // and anything active but outside it gets hidden below, same as something
  // truly deactivated in workout-builder.
  let scopedActiveIds = toImport.map((e) => e.id)
  if (libraryId) {
    const libRes = await fetch(`${baseUrl}/libraries/${libraryId}/exercises`, { headers: authHeader })
    if (!libRes.ok) {
      return NextResponse.json(
        { error: `שליפת תרגילי המאגר מ-workout-builder נכשלה (${libRes.status})` },
        { status: 502 }
      )
    }
    const libraryIds: number[] = await libRes.json()
    const librarySet = new Set(libraryIds)
    toImport = toImport.filter((e) => librarySet.has(e.id))
    scopedActiveIds = toImport.map((e) => e.id)
  }

  let created = 0
  let updated = 0
  for (const remote of toImport) {
    const result = await prisma.exercise.upsert({
      where: { externalId: remote.id },
      update: { name: remote.name, isActive: true },
      create: { name: remote.name, externalId: remote.id, isActive: true },
    })
    if (result.createdAt.getTime() === result.updatedAt.getTime()) created++
    else updated++
  }

  // Exercises outside this sync's scope: truly deactivated in workout-builder,
  // or (when a library is chosen) simply not part of that library
  const { count: hiddenRemote } = await prisma.exercise.updateMany({
    where: { externalId: { not: null, notIn: scopedActiveIds } },
    data: { isActive: false },
  })

  // Exercises created locally before this integration existed (no externalId) -
  // hidden from pickers in favor of the workout-builder catalog, history kept
  const { count: hiddenLegacy } = await prisma.exercise.updateMany({
    where: { externalId: null, isActive: true },
    data: { isActive: false },
  })

  return NextResponse.json({
    created,
    updated,
    hiddenRemote,
    hiddenLegacy,
    total: toImport.length,
  })
}
