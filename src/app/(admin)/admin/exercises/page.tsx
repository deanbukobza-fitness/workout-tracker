import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'
import DeleteExerciseButton from './DeleteExerciseButton'
import SyncExerciseCatalogButton from './SyncExerciseCatalogButton'
import ToggleActiveButton from './ToggleActiveButton'

export default async function AdminExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const showHidden = status === 'hidden'

  const [exercises, activeCount, hiddenCount] = await Promise.all([
    prisma.exercise.findMany({
      where: { isActive: !showHidden },
      include: {
        benchmarks: { orderBy: { levelOrder: 'asc' } },
        _count: { select: { workoutSessions: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.exercise.count({ where: { isActive: true } }),
    prisma.exercise.count({ where: { isActive: false } }),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">תרגילים</h1>
        <Link href="/admin/exercises/new">
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Plus size={16} className="ms-1" />
            תרגיל חדש
          </Button>
        </Link>
      </div>

      <SyncExerciseCatalogButton />

      <div className="flex gap-2 border-b border-border">
        <Link
          href="/admin/exercises"
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            !showHidden
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          פעילים ({activeCount})
        </Link>
        <Link
          href="/admin/exercises?status=hidden"
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            showHidden
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          מוסתרים ({hiddenCount})
        </Link>
      </div>

      <div className="space-y-3">
        {exercises.map((ex) => (
          <div key={ex.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{ex.name}</h3>
                  {ex.youtubeUrl && (
                    <span className="text-xs text-red-500 font-medium">▶ YouTube</span>
                  )}
                </div>
                {ex.notes && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ex.notes}</p>
                )}
                {ex.benchmarks.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {ex.benchmarks.map((b) => (
                      <span
                        key={b.id}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {b.label}: {b.minWeight}+
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {ex._count.workoutSessions} אימונים הוזנו
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <ToggleActiveButton exerciseId={ex.id} isActive={ex.isActive} />
                <Link href={`/admin/exercises/${ex.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil size={14} />
                  </Button>
                </Link>
                <DeleteExerciseButton exerciseId={ex.id} exerciseName={ex.name} />
              </div>
            </div>
          </div>
        ))}
        {exercises.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            {showHidden ? 'אין תרגילים מוסתרים' : 'עוד אין תרגילים. הוסיפי את הראשון!'}
          </p>
        )}
      </div>
    </div>
  )
}
