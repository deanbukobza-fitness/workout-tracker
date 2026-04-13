'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Exercise {
  id: string
  name: string
}

interface SlotState {
  slot: number
  exerciseId: string
  exerciseName: string
}

interface Props {
  monthKey: string
  exercises: Exercise[]
  initialSlots: SlotState[]
}

export default function KeyExercisePicker({ monthKey, exercises, initialSlots }: Props) {
  const router = useRouter()
  const [slots, setSlots] = useState<Record<number, string>>(
    Object.fromEntries(initialSlots.map((s) => [s.slot, s.exerciseId]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setSlot(slot: number, exerciseId: string) {
    setSlots((prev) => ({ ...prev, [slot]: exerciseId }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const slotsPayload = Object.entries(slots)
      .filter(([, exId]) => exId)
      .map(([slot, exerciseId]) => ({ slot: Number(slot), exerciseId }))

    await fetch('/api/key-exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthKey, slots: slotsPayload }),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        בחרי עד 4 תרגילים שיהוו את תרגילי המפתח לחודש זה. הם יופיעו בראש הדשבורד של המתאמנות.
      </p>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((slot) => (
          <div key={slot} className="space-y-2">
            <Label htmlFor={`slot-${slot}`}>תרגיל מפתח {slot}</Label>
            <select
              id={`slot-${slot}`}
              value={slots[slot] ?? ''}
              onChange={(e) => setSlot(slot, e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— ללא —</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-pink-600 hover:bg-pink-700"
      >
        {saving ? 'שומרת...' : saved ? '✓ נשמר!' : 'שמרי שינויים'}
      </Button>
    </div>
  )
}
