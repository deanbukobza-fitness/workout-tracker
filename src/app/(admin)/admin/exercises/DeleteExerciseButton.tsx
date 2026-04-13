'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Props {
  exerciseId: string
  exerciseName: string
}

export default function DeleteExerciseButton({ exerciseId, exerciseName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`למחוק את תרגיל "${exerciseName}"? לא ניתן לבטל פעולה זו.`)) return
    setLoading(true)
    await fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-500 hover:bg-red-50 hover:border-red-300"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 size={14} />
    </Button>
  )
}
