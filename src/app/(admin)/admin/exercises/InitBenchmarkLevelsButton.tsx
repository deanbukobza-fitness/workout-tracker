'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ListOrdered } from 'lucide-react'

export default function InitBenchmarkLevelsButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (
      !confirm(
        'לכל התרגילים הפעילים יוגדרו 4 רמות קבועות (מתאמנת / מבינה עניין / מתקדמת / מקצוענית). רמה חמישית קיימת תימחק. להמשיך?'
      )
    ) {
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/exercises/init-benchmark-levels', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setIsError(true)
        setMessage(data.error || 'הפעולה נכשלה')
      } else {
        setIsError(false)
        setMessage(`עודכנו ${data.exercisesProcessed} תרגילים`)
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
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-medium text-sm">אתחול רמות לתרגילים פעילים</div>
          <div className="text-xs text-muted-foreground">
            פותח 4 רמות קבועות (מתאמנת / מבינה עניין / מתקדמת / מקצוענית) לכל תרגיל פעיל שאין לו עדיין
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
          <ListOrdered size={14} className="ms-1" />
          {loading ? 'מאתחל...' : 'אתחול רמות'}
        </Button>
      </div>
      {message && (
        <p className={`text-xs ${isError ? 'text-red-600' : 'text-muted-foreground'}`}>{message}</p>
      )}
    </div>
  )
}
