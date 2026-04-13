import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { epley1RM, sessionVolume, bestEpley, isNewVolumePR } from '@/lib/calculations'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: sessionId } = await params
  const body = await req.json()
  const weight = Number(body.weight)
  const reps = Number(body.reps)

  // Verify the session belongs to the current user
  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: { sets: true },
  })
  if (!workoutSession || workoutSession.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Determine set number
  const setNumber = workoutSession.sets.length + 1
  const setVolume = weight * reps
  const setEpley = epley1RM(weight, reps)

  // Create the set
  const newSet = await prisma.workoutSet.create({
    data: {
      sessionId,
      setNumber,
      weight,
      reps,
      volume: setVolume,
      epley1RM: setEpley,
    },
  })

  // Recompute session aggregates
  const allSets = [...workoutSession.sets, { weight, reps }]
  const newTotalVolume = sessionVolume(allSets)
  const newBest1RM = bestEpley(allSets)

  // Find prior sessions' best volume (exclude current session)
  const priorBest = await prisma.workoutSession.aggregate({
    where: {
      userId: session.user.id,
      exerciseId: workoutSession.exerciseId,
      id: { not: sessionId },
    },
    _max: { totalVolume: true },
  })
  const priorMax = priorBest._max.totalVolume

  const isPR = isNewVolumePR(newTotalVolume, priorMax)

  // Update session
  const updatedSession = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      totalVolume: newTotalVolume,
      estimated1RM: newBest1RM,
      isVolumePR: isPR,
    },
  })

  return NextResponse.json({
    set: newSet,
    session: {
      id: updatedSession.id,
      totalVolume: updatedSession.totalVolume,
      estimated1RM: updatedSession.estimated1RM,
      isVolumePR: isPR,
    },
  })
}
