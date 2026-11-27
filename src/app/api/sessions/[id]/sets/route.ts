import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import {
  brzycki1RM,
  sessionVolume,
  bestBrzycki,
  isNewVolumePR,
  isNewRepMaxPR,
} from '@/lib/calculations'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession()
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
  const isOwner = workoutSession?.userId === session.user.id
  const isKioskOrAdmin = session.user.role === 'KIOSK' || session.user.role === 'ADMIN'
  if (!workoutSession || (!isOwner && !isKioskOrAdmin)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Determine set number
  const setNumber = workoutSession.sets.length + 1
  const setVolume = weight * reps
  const setOneRepMax = brzycki1RM(weight, reps)

  // Create the set
  const newSet = await prisma.workoutSet.create({
    data: {
      sessionId,
      setNumber,
      weight,
      reps,
      volume: setVolume,
      oneRepMax: setOneRepMax,
    },
  })

  // Recompute session aggregates
  const allSets = [...workoutSession.sets, { weight, reps }]
  const newTotalVolume = sessionVolume(allSets)
  const newBest1RM = bestBrzycki(allSets)

  // Find prior sessions' best volume and best 1RM (exclude current session) -
  // kept as two independent PR checks on purpose: a single heavy set
  // shouldn't be judged the same way as three consistently solid sets
  const priorBest = await prisma.workoutSession.aggregate({
    where: {
      userId: workoutSession.userId,
      exerciseId: workoutSession.exerciseId,
      id: { not: sessionId },
    },
    _max: { totalVolume: true, estimated1RM: true },
  })

  const isVolumePR = isNewVolumePR(newTotalVolume, priorBest._max.totalVolume)
  const isRepMaxPR = isNewRepMaxPR(newBest1RM, priorBest._max.estimated1RM)

  // Update session
  const updatedSession = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      totalVolume: newTotalVolume,
      estimated1RM: newBest1RM,
      isVolumePR,
      isRepMaxPR,
    },
  })

  return NextResponse.json({
    set: newSet,
    session: {
      id: updatedSession.id,
      totalVolume: updatedSession.totalVolume,
      estimated1RM: updatedSession.estimated1RM,
      isVolumePR,
      isRepMaxPR,
    },
  })
}
