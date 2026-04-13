import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ExerciseForm from '@/components/admin/ExerciseForm'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Params = { params: Promise<{ id: string }> }

export default async function EditExercisePage({ params }: Params) {
  const { id } = await params

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { benchmarks: { orderBy: { levelOrder: 'asc' } } },
  })
  if (!exercise) redirect('/admin/exercises')

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link
        href="/admin/exercises"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronRight size={16} />
        חזרה לרשימה
      </Link>
      <h1 className="text-2xl font-bold">עריכת תרגיל: {exercise.name}</h1>
      <ExerciseForm
        initialData={{
          id: exercise.id,
          name: exercise.name,
          notes: exercise.notes,
          youtubeUrl: exercise.youtubeUrl,
          benchmarks: exercise.benchmarks.map((b) => ({
            label: b.label,
            minWeight: b.minWeight,
            levelOrder: b.levelOrder,
          })),
        }}
      />
    </div>
  )
}
