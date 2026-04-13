'use client'

import type { BenchmarkData, LevelDistributionEntry } from '@/lib/level-utils'
import { getEncouragementMessage } from '@/lib/level-utils'
import { useMemo } from 'react'

const levelColors: Record<number, string> = {
  1: 'bg-slate-400',
  2: 'bg-blue-400',
  3: 'bg-green-500',
  4: 'bg-amber-500',
  5: 'bg-pink-600',
}

const levelTextColors: Record<number, string> = {
  1: 'text-slate-600',
  2: 'text-blue-600',
  3: 'text-green-700',
  4: 'text-amber-600',
  5: 'text-pink-700',
}

interface Props {
  myLevel: BenchmarkData | null
  myBest1RM: number
  distribution: LevelDistributionEntry[]
  totalStudioAthletes: number
}

export default function LevelIndicator({
  myLevel,
  myBest1RM,
  distribution,
  totalStudioAthletes,
}: Props) {
  const encouragement = useMemo(
    () => (myLevel ? getEncouragementMessage(myLevel.label) : 'המשיכי להתאמן!'),
    [myLevel]
  )

  const myDistEntry = distribution.find((d) => d.label === myLevel?.label)
  const myPercentage = myDistEntry?.percentage ?? 0

  return (
    <div className="rounded-xl border border-border p-5 space-y-4 bg-card">
      <h3 className="font-bold text-lg">הרמה שלך</h3>

      {myBest1RM === 0 ? (
        <p className="text-muted-foreground text-sm">
          בצעי את הסט הראשון כדי לראות את הרמה שלך
        </p>
      ) : (
        <>
          {/* Level badge */}
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full px-4 py-1.5 font-bold text-white text-sm ${
                levelColors[myLevel?.levelOrder ?? 1]
              }`}
            >
              {myLevel?.label ?? 'טרם הוקצתה'}
            </div>
            <div className="text-sm text-muted-foreground">
              1RM משוערת:{' '}
              <span className="font-semibold text-foreground">{myBest1RM.toFixed(1)} ק״ג</span>
            </div>
          </div>

          {/* Studio distribution bar */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              התפלגות רמות בסטודיו ({totalStudioAthletes} מתאמנות)
            </p>
            <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
              {distribution.map((d) => (
                <div
                  key={d.label}
                  className={`${levelColors[d.levelOrder]} transition-all ${
                    d.label === myLevel?.label ? 'ring-2 ring-white ring-offset-1' : 'opacity-60'
                  }`}
                  style={{ width: `${Math.max(d.percentage, d.count > 0 ? 5 : 0)}%` }}
                  title={`${d.label}: ${d.percentage}%`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {distribution.map((d) => (
                <div key={d.label} className="text-center" style={{ flex: 1 }}>
                  <div
                    className={`text-xs font-medium ${levelTextColors[d.levelOrder]} ${
                      d.label === myLevel?.label ? 'font-bold' : ''
                    }`}
                  >
                    {d.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{d.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Peer comparison */}
          {myLevel && (
            <div
              className={`rounded-lg p-3 text-center ${
                levelColors[myLevel.levelOrder]
              } bg-opacity-10 border border-current border-opacity-20`}
            >
              <p className={`text-sm font-semibold ${levelTextColors[myLevel.levelOrder]}`}>
                את בין {myPercentage}% מחברות הסטודיו ברמה זו
              </p>
              <p className="text-sm mt-1 text-muted-foreground">{encouragement}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
