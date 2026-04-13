export interface BenchmarkData {
  id: string
  label: string
  minWeight: number
  levelOrder: number
}

export interface LevelDistributionEntry {
  label: string
  levelOrder: number
  count: number
  percentage: number
}

// Map a best estimated 1RM to a level label based on benchmarks
export function assignLevel(
  best1RM: number,
  benchmarks: BenchmarkData[]
): BenchmarkData | null {
  const sorted = [...benchmarks].sort((a, b) => b.levelOrder - a.levelOrder)
  for (const b of sorted) {
    if (best1RM >= b.minWeight) return b
  }
  return null
}

// Compute studio-wide level distribution as percentages (anonymised)
export function computeDistribution(
  athleteBest1RMs: number[],
  benchmarks: BenchmarkData[]
): LevelDistributionEntry[] {
  const sorted = [...benchmarks].sort((a, b) => a.levelOrder - b.levelOrder)
  const counts: Record<string, number> = {}
  sorted.forEach((b) => (counts[b.label] = 0))

  let unranked = 0
  athleteBest1RMs.forEach((rm) => {
    const level = assignLevel(rm, benchmarks)
    if (level) counts[level.label] = (counts[level.label] || 0) + 1
    else unranked++
  })

  const total = athleteBest1RMs.length || 1
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
