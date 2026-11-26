'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function SyncDailyExercisesButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  async function handleSync() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/sync-daily-exercises', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setIsError(true)
        setMessage(data.error || 'הסנכרון נכשל')
      } else if (!data.synced) {
        setIsError(false)
        setMessage(data.message)
      } else {
        setIsError(false)
        setMessage(`סונכרן: ${data.exercises.join(' + ')} (${data.workout_label ?? ''})`)
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
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-sm">סנכרון מ-workout-builder</div>
          <div className="text-xs text-muted-foreground">
            מביא את שני תרגילי היום מהתוכנית החודשית ומעדכן את דף הבית
          </div>
        </div>
        <Button size="sm" onClick={handleSync} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'מסנכרן...' : 'סנכרן עכשיו'}
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-muted-foreground'}`}>{message}</p>
      )}
    </div>
  )
}
