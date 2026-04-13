import ExerciseForm from '@/components/admin/ExerciseForm'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function NewExercisePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link
        href="/admin/exercises"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronRight size={16} />
        חזרה לרשימה
      </Link>
      <h1 className="text-2xl font-bold">תרגיל חדש</h1>
      <ExerciseForm />
    </div>
  )
}
