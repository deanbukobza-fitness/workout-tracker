import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { currentMonthKey } from '@/lib/date-utils'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await auth()

  const { q } = await searchParams
  const monthKey = currentMonthKey()

  const [keyExercises, allExercises] = await Promise.all([
    prisma.monthlyKeyExercise.findMany({
      where: { monthKey },
      include: { exercise: true },
      orderBy: { slot: 'asc' },
    }),
    prisma.exercise.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
    }),
  ])

  const keyIds = new Set(keyExercises.map((k) => k.exerciseId))

  return (
    <div className="p-4 space-y-5 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold pt-2">בחרי תרגיל</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <form>
          <Input
            name="q"
            defaultValue={q}
            placeholder="חפשי תרגיל..."
            className="pe-10"
          />
        </form>
      </div>

      {/* Key exercises (always shown) */}
      {!q && keyExercises.length > 0 && (
        <section>
          <h2 className="font-semibold text-sm text-pink-600 mb-2">🔑 תרגילי מפתח החודש</h2>
          <div className="space-y-2">
            {keyExercises.map(({ slot, exercise }) => (
              <Link
                key={slot}
                href={`/log/${exercise.id}`}
                className="flex items-center justify-between rounded-lg border-2 border-pink-200 bg-pink-50 p-3 hover:bg-pink-100 transition-colors"
              >
                <span className="font-semibold">{exercise.name}</span>
                <Badge variant="outline" className="text-pink-600 border-pink-300">
                  מפתח
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All exercises */}
      <section>
        <h2 className="font-semibold text-sm text-muted-foreground mb-2">
          {q ? `תוצאות עבור "${q}"` : 'כל התרגילים'}
        </h2>
        <div className="space-y-2">
          {allExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/log/${exercise.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted transition-colors"
            >
              <span className="font-medium">{exercise.name}</span>
              {keyIds.has(exercise.id) && (
                <Badge className="bg-pink-100 text-pink-600 border-pink-200">מפתח</Badge>
              )}
            </Link>
          ))}
          {allExercises.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              לא נמצאו תרגילים
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
