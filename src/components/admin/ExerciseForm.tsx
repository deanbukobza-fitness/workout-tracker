'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import YouTubeEmbed from '@/components/shared/YouTubeEmbed'

interface BenchmarkRow {
  levelOrder: number
  label: string
  minWeight: string
}

interface ExerciseData {
  id?: string
  name: string
  notes?: string | null
  youtubeUrl?: string | null
  benchmarks: Array<{ label: string; minWeight: number; levelOrder: number }>
}

interface Props {
  initialData?: ExerciseData
}

// Fixed, studio-wide levels - the 5th strengthlevel.com tier (Elite) is
// dropped on purpose, it's too far from what's relevant for studio athletes
const LEVEL_LABELS = ['מתאמנת', 'מבינה עניין', 'מתקדמת', 'מקצוענית']

export default function ExerciseForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [name, setName] = useState(initialData?.name ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtubeUrl ?? '')
  const [benchmarks, setBenchmarks] = useState<BenchmarkRow[]>(
    LEVEL_LABELS.map((label, i) => {
      const levelOrder = i + 1
      const existing = initialData?.benchmarks.find((b) => b.levelOrder === levelOrder)
      return { levelOrder, label, minWeight: existing ? String(existing.minWeight) : '' }
    })
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateBenchmark(levelOrder: number, value: string) {
    setBenchmarks((prev) => prev.map((b) => (b.levelOrder === levelOrder ? { ...b, minWeight: value } : b)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      name: name.trim(),
      notes: notes.trim() || null,
      youtubeUrl: youtubeUrl.trim() || null,
      benchmarks: benchmarks.map((b) => ({
        label: b.label,
        minWeight: Number(b.minWeight) || 0,
        levelOrder: b.levelOrder,
      })),
    }

    try {
      const url = isEdit ? `/api/exercises/${initialData.id}` : '/api/exercises'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('שגיאה בשמירה')
      router.push('/admin/exercises')
      router.refresh()
    } catch (err) {
      setError('שגיאה בשמירת התרגיל. נסי שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">שם התרגיל *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='לדוגמה: סקוואט, לחיצת חזה, דדליפט'
          required
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">הסבר והנחיות</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="טיפים לביצוע, נקודות חשובות..."
          rows={3}
        />
      </div>

      {/* YouTube */}
      <div className="space-y-2">
        <Label htmlFor="youtube">קישור YouTube (אופציונלי)</Label>
        <Input
          id="youtube"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          type="url"
        />
        {youtubeUrl && <YouTubeEmbed url={youtubeUrl} className="mt-2 max-h-48" />}
      </div>

      {/* Benchmarks */}
      <div className="space-y-3">
        <Label>רמות ואמות מידה (1RM בק״ג)</Label>
        <div className="space-y-2">
          {benchmarks.map((b) => (
            <div key={b.levelOrder} className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm w-5 text-center shrink-0">
                {b.levelOrder}
              </span>
              <span className="flex-1 text-sm">{b.label}</span>
              <Input
                value={b.minWeight}
                onChange={(e) => updateBenchmark(b.levelOrder, e.target.value)}
                placeholder="משקל מינ׳"
                type="number"
                min={0}
                step={0.5}
                className="w-24 text-center"
              />
              <span className="text-xs text-muted-foreground shrink-0">ק״ג+</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          הרמות מוצגות בסדר עולה. מתאמנת תוצב ברמה הגבוהה ביותר שאליה הגיעה. אפשר למלא את
          המשקלים ידנית, או לסנכרן אותם אוטומטית מ-strengthlevel.com למעלה.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700">
          {loading ? 'שומרת...' : isEdit ? 'עדכני תרגיל' : 'הוסיפי תרגיל'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          ביטול
        </Button>
      </div>
    </form>
  )
}
