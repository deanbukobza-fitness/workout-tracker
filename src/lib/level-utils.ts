export interface BenchmarkPointData {
  bodyweightKg: number
  minWeight: number
}

export interface BenchmarkData {
  id: string
  label: string
  minWeight: number
  levelOrder: number
  points?: BenchmarkPointData[]
}

// The weight threshold for a level, adjusted to the athlete's bodyweight by
// linearly interpolating between the nearest bodyweight-bracket points
// (e.g. from strengthlevel.com). Falls back to the flat minWeight when no
// bodyweight is known or no bracket points were ever synced for this level.
function thresholdForBodyweight(b: BenchmarkData, bodyweightKg: number | null | undefined): number {
  if (!bodyweightKg || !b.points || b.points.length === 0) return b.minWeight

  const sorted = [...b.points].sort((a, c) => a.bodyweightKg - c.bodyweightKg)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (bodyweightKg <= first.bodyweightKg) return first.minWeight
  if (bodyweightKg >= last.bodyweightKg) return last.minWeight

  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i]
    const hi = sorted[i + 1]
    if (bodyweightKg >= lo.bodyweightKg && bodyweightKg <= hi.bodyweightKg) {
      const t = (bodyweightKg - lo.bodyweightKg) / (hi.bodyweightKg - lo.bodyweightKg)
      return lo.minWeight + t * (hi.minWeight - lo.minWeight)
    }
  }
  return b.minWeight
}

export interface LevelDistributionEntry {
  label: string
  levelOrder: number
  count: number
  percentage: number
}

// Map a best estimated 1RM to a level label based on benchmarks, adjusted to
// the athlete's bodyweight when known
export function assignLevel(
  best1RM: number,
  benchmarks: BenchmarkData[],
  bodyweightKg?: number | null
): BenchmarkData | null {
  const sorted = [...benchmarks].sort((a, b) => b.levelOrder - a.levelOrder)
  for (const b of sorted) {
    if (best1RM >= thresholdForBodyweight(b, bodyweightKg)) return b
  }
  return null
}

export interface AthleteResult {
  best1RM: number
  bodyweightKg?: number | null
}

// Compute studio-wide level distribution as percentages (anonymised). Each
// athlete is leveled against her own bodyweight-adjusted thresholds.
export function computeDistribution(
  athletes: AthleteResult[],
  benchmarks: BenchmarkData[]
): LevelDistributionEntry[] {
  const sorted = [...benchmarks].sort((a, b) => a.levelOrder - b.levelOrder)
  const counts: Record<string, number> = {}
  sorted.forEach((b) => (counts[b.label] = 0))

  let unranked = 0
  athletes.forEach(({ best1RM, bodyweightKg }) => {
    const level = assignLevel(best1RM, benchmarks, bodyweightKg)
    if (level) counts[level.label] = (counts[level.label] || 0) + 1
    else unranked++
  })

  const total = athletes.length || 1
  return sorted.map((b) => ({
    label: b.label,
    levelOrder: b.levelOrder,
    count: counts[b.label] || 0,
    percentage: Math.round(((counts[b.label] || 0) / total) * 100),
  }))
}

// Encouragement messages per level (Hebrew)
const messages: Record<string, string[]> = {
  מתחילה: [
    'כל מסע מתחיל בצעד הראשון — את בדרך הנכונה!',
    'כל אימון מקרב אותך ליעד. המשיכי!',
    'ההתחלה היא הצעד הכי אמיץ. כל הכבוד!',
  ],
  'מתחילה+': [
    'ההתקדמות שלך מרשימה! המשיכי כך.',
    'את כבר חזקה יותר ממה שחשבת. תמשיכי!',
    'הבסיס שלך חזק — עכשיו עולות לרמה הבאה!',
  ],
  ביניים: [
    'את כבר מרימה משקלים שרוב הנשים חולמות עליהם!',
    'חצי הדרך ומעלה — הכוח שלך ניכר!',
    'ביצועים מצוינים! הסטודיו גאה בך.',
  ],
  'ביניים+': [
    'כוח אמיתי. את כמעט בפסגה!',
    'קומץ נשים מגיעות לרמה שלך — את מיוחדת!',
    'עוד קצת ואת בעילית הסטודיו!',
  ],
  מתקדמת: [
    'את ספורטאית עילית. השראה לכל הסטודיו!',
    'הגבת לפסגה — המשיכי לשבור שיאים!',
    'אין גבול לכוח שלך. מדהים!',
  ],
}

export function getEncouragementMessage(levelLabel: string): string {
  const pool = messages[levelLabel] ?? ['כל הכבוד! המשיכי להתאמן!']
  return pool[Math.floor(Math.random() * pool.length)]
}
