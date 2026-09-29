'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { KeyRound, Copy, Check } from 'lucide-react'

interface Props {
  athleteId: string
  athleteName: string
}

export default function ResetPasswordButton({ athleteId, athleteName }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleConfirm() {
    if (!confirm(`לאפס את הסיסמה של "${athleteName}"? הסיסמה הישנה תפסיק לעבוד.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/athletes/${athleteId}/reset-password`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setNewPassword(data.password)
      setOpen(true)
    } catch {
      alert('אירעה שגיאה באיפוס הסיסמה')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!newPassword) return
    await navigator.clipboard.writeText(newPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleConfirm}
        disabled={loading}
        title="איפוס סיסמה"
      >
        <KeyRound size={14} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הסיסמה אופסה בהצלחה</DialogTitle>
            <DialogDescription>
              הסיסמה החדשה של {athleteName} מוצגת פעם אחת בלבד. העתיקי אותה ומסרי אותה למתאמנת.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input readOnly value={newPassword ?? ''} className="font-mono" />
            <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>סגירה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
