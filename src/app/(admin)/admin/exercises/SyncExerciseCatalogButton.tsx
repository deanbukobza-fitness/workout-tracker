'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function SyncExerciseCatalogButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  async function handleSync() {
    if (!confirm('לייבא את כל התרגילים הפעילים מ-workout-builder? תרגילים מקומיים ישנים (שלא הגיעו משם) יוסתרו.')) {
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/sync-exercise-catalog', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setIsError(true)
        setMessage(data.error || 'הסנכרון נכשל')
      } else {
        setIsError(false)
        setMessage(
          `נוספו ${data.created}, עודכנו ${data.updated}, הוסתרו ${data.hiddenRemote + data.hiddenLegacy} (מתוך ${data.total} פעילים ב-workout-builder)`
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
    <div className="rounded-lg border border-border p-4 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium text-sm">סנכרון קטלוג תרגילים מ-workout-builder</div>
          <div className="text-xs text-muted-foreground">
            מייבא את כל התרגילים הפעילים משם, לפי מזהה
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleSync} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'מסנכרן...' : 'סנכרן קטלוג'}
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-muted-foreground'}`}>{message}</p>
      )}
    </div>
  )
}
