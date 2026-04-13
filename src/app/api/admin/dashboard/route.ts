import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Recent PRs (last 7 days)
  const recentPRs = await prisma.workoutSession.findMany({
    where: { isVolumePR: true, loggedAt: { gte: sevenDaysAgo } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      exercise: { select: { id: true, name: true } },
    },
    orderBy: { loggedAt: 'desc' },
    take: 20,
  })

  // All athletes with their last activity
  const athletes = await prisma.user.findMany({
    where: { role: 'ATHLETE' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      workoutSessions: {
        orderBy: { loggedAt: 'desc' },
        take: 1,
        select: { loggedAt: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const athletesWithStatus = athletes.map((a) => {
    const lastActivity = a.workoutSessions[0]?.loggedAt ?? null
    let status: 'active' | 'inactive' | 'new' = 'new'
    if (lastActivity) {
      status = lastActivity >= fourteenDaysAgo ? 'active' : 'inactive'
    }
    return {
      id: a.id,
      name: a.name,
      email: a.email,
      createdAt: a.createdAt,
      lastActivity,
      status,
    }
  })

  const active = athletesWithStatus.filter((a) => a.status === 'active').length
  const inactive = athletesWithStatus.filter((a) => a.status === 'inactive').length
  const newAthletes = athletesWithStatus.filter((a) => a.status === 'new').length

  return NextResponse.json({
    recentPRs,
    athletes: athletesWithStatus,
    summary: {
      total: athletes.length,
      active,
      inactive,
      new: newAthletes,
    },
  })
}
