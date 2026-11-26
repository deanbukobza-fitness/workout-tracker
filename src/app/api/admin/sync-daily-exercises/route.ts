import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

interface TodayMonthlyExerciseItem {
  plan_id: number
  plan_label: string
  workout_id: number
  workout_label: string | null
  slot1_exercise_id: number
  slot1_exercise_name: string
  slot2_exercise_id: number
  slot2_exercise_name: string
}

interface TodayMonthlyExercisesResponse {
  date: string
  items: TodayMonthlyExerciseItem[]
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

export async function POST() {
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

  const res = await fetch(`${baseUrl}/month-plans/today-monthly-exercises`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    return NextResponse.json(
      { error: `שליפת תרגילי היום מ-workout-builder נכשלה (${res.status})` },
      { status: 502 }
    )
  }
  const data: TodayMonthlyExercisesResponse = await res.json()

  if (data.items.length === 0) {
    return NextResponse.json({
      date: data.date,
      synced: false,
      message: 'לא נמצא אימון מתוזמן להיום ב-workout-builder',
    })
  }
  if (data.items.length > 1) {
    return NextResponse.json(
      {
        error: 'נמצאו כמה תוכניות עם אימון להיום בו-זמנית - נדרשת בחירה ידנית',
        plans: data.items.map((i) => ({ plan_id: i.plan_id, plan_label: i.plan_label })),
      },
      { status: 409 }
    )
  }

  const item = data.items[0]
  const externalIds = [item.slot1_exercise_id, item.slot2_exercise_id]
  const exercises = await prisma.exercise.findMany({ where: { externalId: { in: externalIds } } })
  const byExternalId = new Map(exercises.map((e) => [e.externalId, e]))

  const unmatched = externalIds.filter((id) => !byExternalId.has(id))
  if (unmatched.length > 0) {
    return NextResponse.json(
      {
        error:
          'חלק מתרגילי היום לא נמצאו בקטלוג המקומי. לחצי על "סנכרן קטלוג תרגילים" בעמוד התרגילים ונסי שוב.',
      },
      { status: 422 }
    )
  }

  const date = new Date(data.date)
  const slot1Exercise = byExternalId.get(item.slot1_exercise_id)!
  const slot2Exercise = byExternalId.get(item.slot2_exercise_id)!

  await prisma.$transaction([
    prisma.dailyKeyExercise.deleteMany({ where: { date } }),
    prisma.dailyKeyExercise.create({
      data: { date, slot: 1, exerciseId: slot1Exercise.id },
    }),
    prisma.dailyKeyExercise.create({
      data: { date, slot: 2, exerciseId: slot2Exercise.id },
    }),
  ])

  return NextResponse.json({
    date: data.date,
    synced: true,
    plan_label: item.plan_label,
    workout_label: item.workout_label,
    exercises: [slot1Exercise.name, slot2Exercise.name],
  })
}
