'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'

interface Props {
  athleteId: string
  currentPhone: string | null
}

export default function EditPhoneButton({ athleteId, currentPhone }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    const input = prompt('מספר טלפון:', currentPhone ?? '')
    if (input === null) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/athletes/${athleteId}/phone`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: input.trim() === '' ? null : input.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'שמירה נכשלה')
      } else {
        router.refresh()
      }
    } catch {
      alert('שגיאת רשת')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading} title="עריכת טלפון">
      <Phone size={14} />
    </Button>
  )
}
