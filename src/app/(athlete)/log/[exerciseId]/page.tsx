import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SetLogger from '@/components/logging/SetLogger'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Params = { params: Promise<{ exerciseId: string }> }

export default async function LogExercisePage({ params }: Params) {
  const session = await auth()
  if (!session) redirect('/login')

  const { exerciseId } = await params

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { benchmarks: { orderBy: { levelOrder: 'asc' } } },
  })
  if (!exercise) redirect('/log')

  // Create a new workout session for this exercise
  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      exerciseId: exercise.id,
    },
  })

  return (
    <div className="max-w-xl mx-auto">
      {/* Back nav */}
      <div className="px-4 pt-4">
        <Link
          href="/log"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronRight size={16} />
          חזרה לבחירת תרגיל
        </Link>
      </div>

      {/* Notes */}
      {exercise.notes && (
        <div className="mx-4 mb-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          {exercise.notes}
        </div>
      )}

      <SetLogger
        sessionId={workoutSession.id}
        exerciseName={exercise.name}
        youtubeUrl={exercise.youtubeUrl}
      />
    </div>
  )
}
