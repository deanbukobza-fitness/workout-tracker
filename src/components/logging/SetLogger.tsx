'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ConfettiCannon from '@/components/shared/ConfettiCannon'
import YouTubeEmbed from '@/components/shared/YouTubeEmbed'
import { ChevronDown, ChevronUp, Flame, Plus, Minus, CheckCircle } from 'lucide-react'

interface SetData {
  setNumber: number
  weight: number
  reps: number
  volume: number
}

interface SessionState {
  totalVolume: number
  estimated1RM: number
  isVolumePR: boolean
}

interface Props {
  sessionId: string
  exerciseName: string
  youtubeUrl?: string | null
}

export default function SetLogger({ sessionId, exerciseName, youtubeUrl }: Props) {
  const router = useRouter()
  const [sets, setSets] = useState<SetData[]>([])
  const [weight, setWeight] = useState(20)
  const [reps, setReps] = useState(10)
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [firePR, setFirePR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const prTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addSet = useCallback(async () => {
    if (loading || weight <= 0 || reps <= 0) return
    setLoading(true)

    try {
      const res = await fetch(`/api/sessions/${sessionId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight, reps }),
      })
      const data = await res.json()

      setSets((prev) => [...prev, {
        setNumber: data.set.setNumber,
        weight: data.set.weight,
        reps: data.set.reps,
        volume: data.set.volume,
      }])
      setSessionState(data.session)
    } finally {
      setLoading(false)
    }
  }, [loading, weight, reps, sessionId])

  const finishWorkout = useCallback(() => {
    if (sets.length === 0) return

    if (sessionState?.isVolumePR) {
      setFirePR(true)
      if (prTimeoutRef.current) clearTimeout(prTimeoutRef.current)
      prTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard')
      }, 4000)
    } else {
      router.push('/dashboard')
    }
  }, [sets.length, sessionState, router])

  const totalVolume = sets.reduce((s, set) => s + set.volume, 0)

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] pb-36">
      <ConfettiCannon fire={firePR} />

      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">{exerciseName}</h1>

        {/* PR Banner — shown after finishing */}
        {firePR && (
          <div className="rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 p-4 text-white text-center animate-bounce">
            <div className="text-3xl">🏆</div>
            <div className="font-bold text-lg">שיא אישי חדש!</div>
            <div className="text-sm opacity-90">נפח אימון: {totalVolume.toFixed(0)} ק״ג</div>
          </div>
        )}

        {/* YouTube toggle */}
        {youtubeUrl && (
          <div>
            <button
              className="flex items-center gap-2 text-sm text-primary font-medium"
              onClick={() => setShowVideo((v) => !v)}
            >
              {showVideo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showVideo ? 'הסתר סרטון' : 'הצג סרטון הדגמה'}
            </button>
            {showVideo && <YouTubeEmbed url={youtubeUrl} className="mt-2" />}
          </div>
        )}

        {/* Sets table */}
        {sets.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-2 text-center font-medium">סט</th>
                  <th className="p-2 text-center font-medium">משקל (ק״ג)</th>
                  <th className="p-2 text-center font-medium">חזרות</th>
                  <th className="p-2 text-center font-medium">נפח</th>
                </tr>
              </thead>
              <tbody>
                {sets.map((s) => (
                  <tr key={s.setNumber} className="border-t border-border">
                    <td className="p-2 text-center">{s.setNumber}</td>
                    <td className="p-2 text-center font-medium">{s.weight}</td>
                    <td className="p-2 text-center">{s.reps}</td>
                    <td className="p-2 text-center text-muted-foreground">{s.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Running volume */}
        {sets.length > 0 && (
          <div className="flex items-center justify-between rounded-lg p-3 transition-colors bg-muted">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Flame size={14} />
              נפח כולל
            </span>
            <span className="font-bold text-lg">
              {totalVolume.toFixed(0)} ק״ג
            </span>
          </div>
        )}

        {sessionState && (
          <div className="text-xs text-muted-foreground text-center">
            1RM משוערת: {sessionState.estimated1RM.toFixed(1)} ק״ג
          </div>
        )}
      </div>

      {/* Fixed input panel */}
      <div className="fixed bottom-16 right-0 left-0 bg-background border-t border-border p-4 shadow-lg">
        <div className="flex gap-4 items-end">
          {/* Weight */}
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block text-center">
              משקל (ק״ג)
            </label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setWeight((w) => Math.max(0, Math.round((w - 2.5) * 10) / 10))}
              >
                <Minus size={14} />
              </Button>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="text-center text-lg font-bold h-10"
                min={0}
                step={2.5}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setWeight((w) => Math.round((w + 2.5) * 10) / 10)}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Reps */}
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block text-center">חזרות</label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setReps((r) => Math.max(1, r - 1))}
              >
                <Minus size={14} />
              </Button>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="text-center text-lg font-bold h-10"
                min={1}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setReps((r) => r + 1)}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            onClick={addSet}
            disabled={loading}
            className="flex-1 h-12 text-base font-bold bg-pink-600 hover:bg-pink-700 text-white"
          >
            {loading ? 'שומרת...' : <><Plus size={18} className="ms-1" />סט {sets.length + 1}</>}
          </Button>
          {sets.length > 0 && (
            <Button
              onClick={finishWorkout}
              disabled={loading}
              className="flex-1 h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle size={18} className="ms-1" />
              סיום אימון
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
