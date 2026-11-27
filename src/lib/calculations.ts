// Brzycki formula: estimates the one-rep max from any set. Matches the
// formula strengthlevel.com's own 1RM calculator and strength-standard
// tables are built on (verified against its live calculator: 100kg x 5 ->
// 112.5kg, matching 100*36/32 exactly; Epley would give 116.67kg instead) -
// this app's benchmark thresholds are sourced from that same site, so the
// athlete's own rep->1RM conversion should use the same formula.
export function brzycki1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight
  return (weight * 36) / Math.max(37 - reps, 1)
}

// Total volume for a session (sum of weight × reps across all sets)
export function sessionVolume(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
}

// Best estimated 1RM across all sets in a session
export function bestBrzycki(sets: { weight: number; reps: number }[]): number {
  if (sets.length === 0) return 0
  return Math.max(...sets.map((s) => brzycki1RM(s.weight, s.reps)))
}

// Is the current session volume a new personal record?
// Returns true on the first session (no prior max) or when beating a prior record.
export function isNewVolumePR(currentVolume: number, priorMax: number | null): boolean {
  return currentVolume > (priorMax ?? 0)
}

// Is the current best estimated 1RM a new personal record for this exercise?
// Kept distinct from the volume PR above on purpose: a single heavy set
// shouldn't be judged the same way as three consistently solid sets, and
// vice versa - both get their own signal in the logging UI.
export function isNewRepMaxPR(currentBest1RM: number, priorMax: number | null): boolean {
  return currentBest1RM > (priorMax ?? 0)
}
