// Returns the current month key in YYYY-MM format
export function currentMonthKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// Returns a human-readable Hebrew month label, e.g. "אפריל 2026"
export function hebrewMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })
}

// Format a date as DD/MM/YYYY in Hebrew locale
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Today's calendar date at UTC midnight - matches how dates round-trip through
// Postgres DATE columns and plain "YYYY-MM-DD" strings from external APIs
export function todayDateOnly(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

// Days since a date
export function daysSince(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Whole years since a birth date, as of today
export function ageFromBirthDate(birthDate: Date | string): number {
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const hadBirthdayThisYear =
    now.getMonth() > d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() >= d.getDate())
  if (!hadBirthdayThisYear) age--
  return age
}
