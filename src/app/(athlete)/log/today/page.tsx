import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getTodaysKeyExercises } from '@/lib/key-exercises'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default async function TodayKeyExercisesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const keyExercises = await getTodaysKeyExercises()

  return (
    <div className="max-w-xl mx-auto p-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronRight size={16} />
        חזרה
      </Link>

      <h1 className="text-2xl font-bold text-center mb-8">איזה תרגיל מתחילות?</h1>

      {keyExercises.length === 0 ? (
        <p className="text-muted-foreground text-center">לא הוגדרו תרגילי מפתח להיום</p>
      ) : (
        <div className="flex flex-col gap-4">
          {keyExercises.map(({ slot, exercise }) => (
            <Link
              key={slot}
              href={`/log/today/${exercise.id}`}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 transition-colors py-10 px-4 shadow-sm"
            >
              <span className="text-sm text-pink-400 font-medium mb-1">תרגיל {slot}</span>
              <span className="text-2xl font-bold text-center">{exercise.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
