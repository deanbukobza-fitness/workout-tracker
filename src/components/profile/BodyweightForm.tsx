'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scale } from 'lucide-react'

interface Props {
  initialBodyweightKg: number | null
}

export default function BodyweightForm({ initialBodyweightKg }: Props) {
  const [value, setValue] = useState(initialBodyweightKg?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/profile/bodyweight', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyweightKg: value === '' ? null : Number(value) }),
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
      <Label htmlFor="bodyweight" className="flex items-center gap-1.5 text-sm font-medium">
        <Scale size={14} />
        משקל גוף (ק״ג)
      </Label>
      <p className="text-xs text-muted-foreground">
        מאפשר למד הרמה להתאים את הסף האישי שלך, במקום סף אחיד לכולן
      </p>
      <div className="flex gap-2">
        <Input
          id="bodyweight"
          type="number"
          inputMode="decimal"
          min={1}
          max={300}
          step={0.5}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="לדוגמה 62"
        />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'שומר...' : 'שמירה'}
        </Button>
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
