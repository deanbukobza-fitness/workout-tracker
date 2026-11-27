'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ConfettiCannon from '@/components/shared/ConfettiCannon'
import YouTubeEmbed from '@/components/shared/YouTubeEmbed'
import { assignLevel, getEncouragementMessage, type BenchmarkData } from '@/lib/level-utils'
import { getSetEncouragement } from '@/lib/encouragement'
import { ChevronDown, ChevronUp, Plus, Minus, Trophy } from 'lucide-react'

const TOTAL_SETS = 3

interface SetData {
  setNumber: number
  weight: number
  reps: number
  volume: number
}

interface Props {
  sessionId: string
  exerciseName: string
  youtubeUrl?: string | null
  benchmarks: BenchmarkData[]
  bodyweightKg: number | null
  ageYears: number | null
  initialSets: SetData[]
  initialEstimated1RM: number
}

export default function KeyExerciseLogger({
  sessionId,
  exerciseName,
  youtubeUrl,
  benchmarks,
  bodyweightKg,
  ageYears,
  initialSets,
  initialEstimated1RM,
}: Props) {
  const router = useRouter()
  const [sets, setSets] = useState<SetData[]>(initialSets)
  const [weight, setWeight] = useState(20)
  const [reps, setReps] = useState(10)
  const [loading, setLoading] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [estimated1RM, setEstimated1RM] = useState(initialEstimated1RM)
  const [isRepMaxPR, setIsRepMaxPR] = useState(false)
  const [isVolumePR, setIsVolumePR] = useState(false)

  const finished = sets.length >= TOTAL_SETS

  const level = useMemo(
    () => (finished ? assignLevel(estimated1RM, benchmarks, bodyweightKg, ageYears) : null),
    [finished, estimated1RM, benchmarks, bodyweightKg, ageYears]
  )

  const saveSet = useCallback(async () => {
    if (loading || weight <= 0 || reps <= 0 || finished) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight, reps }),
      })
      const data = await res.json()

      setSets((prev) => [
        ...prev,
        {
          setNumber: data.set.setNumber,
          weight: data.set.weight,
          reps: data.set.reps,
          volume: data.set.volume,
        },
      ])
      setEstimated1RM(data.session.estimated1RM)
      setIsRepMaxPR(data.session.isRepMaxPR)
      setIsVolumePR(data.session.isVolumePR)
      setToast(getSetEncouragement())
      setTimeout(() => setToast(null), 1800)
    } finally {
      setLoading(false)
    }
  }, [loading, weight, reps, finished, sessionId])

  if (finished) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-5 text-center">
        <ConfettiCannon fire={isRepMaxPR} />

        <h1 className="text-2xl font-bold">{exerciseName}</h1>
        <p className="text-muted-foreground">סיימת את 3 הסטים! 🎉</p>

        {isRepMaxPR && (
          <div className="rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 p-4 text-white animate-bounce">
            <div className="text-3xl">🎉</div>
            <div className="font-bold text-lg">איזה כיף! שיא אישי חדש!</div>
          </div>
        )}

        {isVolumePR && (
          <div className="rounded-lg bg-muted p-3 text-sm flex items-center justify-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            גם נפח האימון הכי גבוה שלך בתרגיל הזה
          </div>
        )}

        {level && (
          <div className="rounded-xl border border-border p-4">
            <div className="text-sm text-muted-foreground mb-1">הרמה שלך בתרגיל הזה</div>
            <div className="text-xl font-bold text-pink-600">{level.label}</div>
            <p className="text-sm text-muted-foreground mt-2">{getEncouragementMessage(level.label)}</p>
          </div>
        )}

        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full h-12 text-base font-bold bg-pink-600 hover:bg-pink-700 text-white"
        >
          סיימתי
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-5">
      <h1 className="text-2xl font-bold text-center">{exerciseName}</h1>
      <p className="text-center text-muted-foreground">
        סט {sets.length + 1} מתוך {TOTAL_SETS}
      </p>

      {youtubeUrl && (
        <div>
          <button
            className="flex items-center gap-2 text-sm text-primary font-medium mx-auto"
            onClick={() => setShowVideo((v) => !v)}
          >
            {showVideo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showVideo ? 'הסתר סרטון' : 'הצג סרטון הדגמה'}
          </button>
          {showVideo && <YouTubeEmbed url={youtubeUrl} className="mt-2" />}
        </div>
      )}

      {toast && (
        <div className="rounded-xl bg-green-100 text-green-800 text-center font-bold py-3 animate-bounce">
          {toast}
        </div>
      )}

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block text-center">משקל (ק״ג)</label>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => setWeight((w) => Math.max(0, Math.round((w - 2.5) * 10) / 10))}
            >
              <Minus size={16} />
            </Button>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="text-center text-xl font-bold h-12"
              min={0}
              step={2.5}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => setWeight((w) => Math.round((w + 2.5) * 10) / 10)}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block text-center">חזרות</label>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => setReps((r) => Math.max(1, r - 1))}
            >
              <Minus size={16} />
            </Button>
            <Input
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="text-center text-xl font-bold h-12"
              min={1}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => setReps((r) => r + 1)}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>

      <Button
        onClick={saveSet}
        disabled={loading}
        className="w-full h-14 text-lg font-bold bg-pink-600 hover:bg-pink-700 text-white"
      >
        {loading ? 'שומרת...' : 'שמרי סט'}
      </Button>
    </div>
  )
}
