'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function SyncBoostButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  async function handleSync() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/sync-boost-subscriptions', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setIsError(true)
        setMessage(data.error || 'הסנכרון נכשל')
      } else {
        setIsError(false)
        setMessage(`נבדקו ${data.checked} מתאמנות, ${data.matched} נמצאו ב-Boost${data.failed ? `, ${data.failed} נכשלו` : ''}`)
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
          <div className="font-medium text-sm">סנכרון מנויים מ-Boost</div>
          <div className="text-xs text-muted-foreground">
            בודק לכל מתאמנת עם מספר טלפון האם יש לה מנוי פעיל ב-BoostApp
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
