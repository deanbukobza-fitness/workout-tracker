'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw } from 'lucide-react'

interface Props {
  exerciseId: string
  pointCount: number
}

export default function BenchmarkCurveSync({ exerciseId, pointCount }: Props) {
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  async function handleSync() {
    if (!slug.trim()) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/exercises/${exerciseId}/sync-benchmark-curve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setIsError(true)
        setMessage(data.error || 'הסנכרון נכשל')
      } else {
        setIsError(false)
        setMessage(
          `נשמרו ${data.bracketCount} נקודות משקל-גוף (${data.bodyweightRange[0]}-${data.bodyweightRange[1]} ק"ג)`
        )
        router.refresh()
      }
    } catch {
      setIsError(true)
      setMessage('שגיאת רשת')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      <div className="font-medium text-sm">סף לפי משקל גוף (strengthlevel.com)</div>
      <p className="text-xs text-muted-foreground">
        {pointCount > 0
          ? `קיימות ${pointCount} נקודות משקל-גוף - המד רמה מתאים את הסף למשקל של כל מתאמנת`
          : 'עדיין לא הוגדר - המד רמה משתמש בסף האחיד הקבוע למעלה'}
      </p>
      <div className="flex gap-2">
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder='slug מהאתר, לדוגמה "bench-press"'
        />
        <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'מסנכרן...' : 'סנכרן'}
        </Button>
      </div>
      {message && (
        <p className={`text-xs ${isError ? 'text-red-600' : 'text-muted-foreground'}`}>{message}</p>
      )}
    </div>
  )
}
