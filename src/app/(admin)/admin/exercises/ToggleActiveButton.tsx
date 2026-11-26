'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface Props {
  exerciseId: string
  isActive: boolean
}

export default function ToggleActiveButton({ exerciseId, isActive }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    try {
      await fetch(`/api/exercises/${exerciseId}/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      title={isActive ? 'הסתר תרגיל' : 'הצג תרגיל'}
    >
      {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
    </Button>
  )
}
