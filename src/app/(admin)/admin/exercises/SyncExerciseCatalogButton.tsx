'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'

interface Library {
  id: number
  name: string
  exercise_count: number
}

export default function SyncExerciseCatalogButton() {
  const [libraries, setLibraries] = useState<Library[] | null>(null)
  const [libraryId, setLibraryId] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/workout-builder-libraries')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Library[]) => setLibraries(data))
      .catch(() => setLibraries([]))
  }, [])

  async function handleSync() {
    const label =
      libraryId === 'all'
        ? 'כל התרגילים הפעילים'
        : libraries?.find((l) => String(l.id) === libraryId)?.name
    if (!confirm(`לייבא את ${label} מ-workout-builder? תרגילים מקומיים ישנים (שלא הגיעו משם) יוסתרו.`)) {
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/sync-exercise-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(libraryId === 'all' ? {} : { libraryId: Number(libraryId) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setIsError(true)
        setMessage(data.error || 'הסנכרון נכשל')
      } else {
        setIsError(false)
        setMessage(
          `נוספו ${data.created}, עודכנו ${data.updated}, הוסתרו ${data.hiddenRemote + data.hiddenLegacy} (מתוך ${data.total} בייבוא)`
        )
        router.refresh()
      }
    } catch {
      setIsError(true)
      setMessage('שגיאת רשת בסנכרון')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div>
        <div className="font-medium text-sm">סנכרון קטלוג תרגילים מ-workout-builder</div>
        <div className="text-xs text-muted-foreground">
          מייבא תרגילים משם, לפי מזהה - אפשר לבחור מאגר ספציפי
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select value={libraryId} onValueChange={(v) => v && setLibraryId(v)}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="בחרי מאגר" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל התרגילים הפעילים</SelectItem>
            {(libraries ?? []).map((lib) => (
              <SelectItem key={lib.id} value={String(lib.id)}>
                {lib.name} ({lib.exercise_count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={handleSync} disabled={loading || libraries === null}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'מסנכרן...' : 'סנכרן'}
        </Button>
      </div>
      {libraries !== null && libraries.length === 0 && (
        <p className="text-xs text-muted-foreground">
          לא נמצאו מאגרים ב-workout-builder (או שהחיבור נכשל) - אפשר עדיין לסנכרן את כל התרגילים
        </p>
      )}
      {message && (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-muted-foreground'}`}>{message}</p>
      )}
    </div>
  )
}
