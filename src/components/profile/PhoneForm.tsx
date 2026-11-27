'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone } from 'lucide-react'

interface Props {
  initialPhone: string | null
}

export default function PhoneForm({ initialPhone }: Props) {
  const [value, setValue] = useState(initialPhone ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/profile/phone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value === '' ? null : value }),
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
      <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium">
        <Phone size={14} />
        מספר טלפון
      </Label>
      <div className="flex gap-2">
        <Input
          id="phone"
          type="tel"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="050-1234567"
        />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'שומר...' : 'שמירה'}
        </Button>
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
