export interface BenchmarkPointData {
  bodyweightKg: number
  minWeight: number
}

export interface BenchmarkAgePointData {
  ageYears: number
  minWeight: number
}

export interface BenchmarkData {
  id: string
  label: string
  minWeight: number
  levelOrder: number
  points?: BenchmarkPointData[]
  agePoints?: BenchmarkAgePointData[]
}

// Linearly interpolates minWeight between the two nearest points by x
// (bodyweight or age), clamping to the first/last point outside the range.
// Returns null when there are no points to interpolate from.
function interpolate(points: { x: number; minWeight: number }[], x: number): number | null {
  if (points.length === 0) return null
  const sorted = [...points].sort((a, b) => a.x - b.x)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (x <= first.x) return first.minWeight
  if (x >= last.x) return last.minWeight

  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i]
    const hi = sorted[i + 1]
    if (x >= lo.x && x <= hi.x) {
      const t = (x - lo.x) / (hi.x - lo.x)
      return lo.minWeight + t * (hi.minWeight - lo.minWeight)
    }
  }
  return null
}

// Age 30 is a verified reference point: strengthlevel.com's own combined
// bodyweight+age calculator reduces to the flat bodyweight-only standards at
// this age for every exercise checked (its "By Age" table is flat across
// 25-40) - so it doubles as the age at which the age-adjustment below is a
// no-op, matching the existing bodyweight-only behavior for athletes who
// haven't entered an age.
const REFERENCE_AGE = 30

// The weight threshold for a level, adjusted to the athlete's bodyweight
// and/or age by linearly interpolating between the nearest bracket points
// (from strengthlevel.com). When both are known, combines them the same way
// strengthlevel.com's own calculator does: the bodyweight-adjusted threshold,
// scaled by how the age-only standard at her age compares to the age-only
// standard at 30 (verified empirically - see level-utils plan notes).
function thresholdFor(
  b: BenchmarkData,
  bodyweightKg: number | null | undefined,
  ageYears: number | null | undefined
): number {
  const bwPoints = (b.points ?? []).map((p) => ({ x: p.bodyweightKg, minWeight: p.minWeight }))
  const agePoints = (b.agePoints ?? []).map((p) => ({ x: p.ageYears, minWeight: p.minWeight }))

  const bwThreshold = bodyweightKg ? interpolate(bwPoints, bodyweightKg) : null
  if (bwThreshold === null) return b.minWeight

  if (!ageYears || agePoints.length === 0) return bwThreshold

  const ageThreshold = interpolate(agePoints, ageYears)
  const referenceAgeThreshold = interpolate(agePoints, REFERENCE_AGE)
  if (ageThreshold === null || !referenceAgeThreshold) return bwThreshold

  return (bwThreshold * ageThreshold) / referenceAgeThreshold
}

export interface LevelDistributionEntry {
  label: string
  levelOrder: number
  count: number
  percentage: number
}

// Map a best estimated 1RM to a level label based on benchmarks, adjusted to
// the athlete's bodyweight and/or age when known
export function assignLevel(
  best1RM: number,
  benchmarks: BenchmarkData[],
  bodyweightKg?: number | null,
  ageYears?: number | null
): BenchmarkData | null {
  const sorted = [...benchmarks].sort((a, b) => b.levelOrder - a.levelOrder)
  for (const b of sorted) {
    if (best1RM >= thresholdFor(b, bodyweightKg, ageYears)) return b
  }
  return null
}

export interface AthleteResult {
  best1RM: number
  bodyweightKg?: number | null
  ageYears?: number | null
}

// Compute studio-wide level distribution as percentages (anonymised). Each
// athlete is leveled against her own bodyweight/age-adjusted thresholds.
export function computeDistribution(
  athletes: AthleteResult[],
  benchmarks: BenchmarkData[]
): LevelDistributionEntry[] {
  const sorted = [...benchmarks].sort((a, b) => a.levelOrder - b.levelOrder)
  const counts: Record<string, number> = {}
  sorted.forEach((b) => (counts[b.label] = 0))

  let unranked = 0
  athletes.forEach(({ best1RM, bodyweightKg, ageYears }) => {
    const level = assignLevel(best1RM, benchmarks, bodyweightKg, ageYears)
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
  מתאמנת: [
    'כל מסע מתחיל בצעד הראשון — את בדרך הנכונה!',
    'כל אימון מקרב אותך ליעד. המשיכי!',
    'ההתחלה היא הצעד הכי אמיץ. כל הכבוד!',
  ],
  'מבינה עניין': [
    'ההתקדמות שלך מרשימה! המשיכי כך.',
    'את כבר חזקה יותר ממה שחשבת. תמשיכי!',
    'הבסיס שלך חזק — עכשיו עולות לרמה הבאה!',
  ],
  מתקדמת: [
    'את כבר מרימה משקלים שרוב הנשים חולמות עליהם!',
    'חצי הדרך ומעלה — הכוח שלך ניכר!',
    'ביצועים מצוינים! הסטודיו גאה בך.',
  ],
  מקצוענית: [
    'את ספורטאית עילית. השראה לכל הסטודיו!',
    'הגעת לפסגה — המשיכי לשבור שיאים!',
    'אין גבול לכוח שלך. מדהים!',
  ],
}

export function getEncouragementMessage(levelLabel: string): string {
  const pool = messages[levelLabel] ?? ['כל הכבוד! המשיכי להתאמן!']
  return pool[Math.floor(Math.random() * pool.length)]
}
