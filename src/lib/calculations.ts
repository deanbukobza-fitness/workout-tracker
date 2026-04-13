// Epley formula: estimates the one-rep max from any set
export function epley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

// Total volume for a session (sum of weight × reps across all sets)
export function sessionVolume(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
}

// Best estimated 1RM across all sets in a session
export function bestEpley(sets: { weight: number; reps: number }[]): number {
  if (sets.length === 0) return 0
  return Math.max(...sets.map((s) => epley1RM(s.weight, s.reps)))
}

// Is the current session volume a new personal record?
// Returns true on the first session (no prior max) or when beating a prior record.
export function isNewVolumePR(currentVolume: number, priorMax: number | null): boolean {
  return currentVolume > (priorMax ?? 0)
}
