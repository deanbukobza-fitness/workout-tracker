'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import YouTubeEmbed from '@/components/shared/YouTubeEmbed'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface BenchmarkRow {
  id: string
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

const DEFAULT_LABELS = ['מתחילה', 'מתחילה+', 'ביניים', 'ביניים+', 'מתקדמת']

export default function ExerciseForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [name, setName] = useState(initialData?.name ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtubeUrl ?? '')
  const [benchmarks, setBenchmarks] = useState<BenchmarkRow[]>(
    initialData?.benchmarks.map((b) => ({
      id: String(b.levelOrder),
      label: b.label,
      minWeight: String(b.minWeight),
    })) ?? DEFAULT_LABELS.map((label, i) => ({ id: String(i + 1), label, minWeight: '' }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateBenchmark(id: string, field: 'label' | 'minWeight', value: string) {
    setBenchmarks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  function addBenchmark() {
    const newId = String(Date.now())
    setBenchmarks((prev) => [...prev, { id: newId, label: '', minWeight: '' }])
  }

  function removeBenchmark(id: string) {
    setBenchmarks((prev) => prev.filter((b) => b.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const validBenchmarks = benchmarks
      .filter((b) => b.label && b.minWeight)
      .map((b, i) => ({
        label: b.label,
        minWeight: Number(b.minWeight),
        levelOrder: i + 1,
      }))

    const payload = {
      name: name.trim(),
      notes: notes.trim() || null,
      youtubeUrl: youtubeUrl.trim() || null,
      benchmarks: validBenchmarks,
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
        <div className="flex items-center justify-between">
          <Label>רמות ואמות מידה (1RM בק״ג)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addBenchmark}>
            <Plus size={14} className="ms-1" />
            הוסיפי רמה
          </Button>
        </div>
        <div className="space-y-2">
          {benchmarks.map((b, idx) => (
            <div key={b.id} className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm w-5 text-center shrink-0">
                {idx + 1}
              </span>
              <Input
                value={b.label}
                onChange={(e) => updateBenchmark(b.id, 'label', e.target.value)}
                placeholder="שם הרמה (לדוגמה: מתחילה)"
                className="flex-1"
              />
              <Input
                value={b.minWeight}
                onChange={(e) => updateBenchmark(b.id, 'minWeight', e.target.value)}
                placeholder="משקל מינ׳"
                type="number"
                min={0}
                step={0.5}
                className="w-24 text-center"
              />
              <span className="text-xs text-muted-foreground shrink-0">ק״ג+</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                onClick={() => removeBenchmark(b.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          הרמות מוצגות בסדר עולה. מתאמנת תוצב ברמה הגבוהה ביותר שאליה הגיעה.
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
