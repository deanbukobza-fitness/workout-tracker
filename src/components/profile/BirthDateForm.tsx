'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cake } from 'lucide-react'

interface Props {
  initialBirthDate: string | null // YYYY-MM-DD, or null
}

export default function BirthDateForm({ initialBirthDate }: Props) {
  const [value, setValue] = useState(initialBirthDate ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/profile/birth-date', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate: value === '' ? null : value }),
      })
      if (!res.ok) {
        const data = await res.json()
        setMessage(data.error || 'שמירה נכשלה')
      } else {
        setMessage('נשמר!')
        router.refresh()
      }
    } catch {
      setMessage('שגיאת רשת')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border p-4 bg-card space-y-2">
      <Label htmlFor="birthDate" className="flex items-center gap-1.5 text-sm font-medium">
        <Cake size={14} />
        תאריך לידה (אופציונלי)
      </Label>
      <p className="text-xs text-muted-foreground">
        מאפשר למד הרמה לדייק את הסף האישי שלך גם לפי גיל, בנוסף למשקל הגוף
      </p>
      <div className="flex gap-2">
        <Input
          id="birthDate"
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'שומר...' : 'שמירה'}
        </Button>
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
