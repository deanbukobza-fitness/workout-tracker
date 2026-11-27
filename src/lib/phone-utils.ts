// Light normalization for Israeli phone numbers - BoostApp's own API accepts
// and normalizes every common form itself (with/without +972, dashes, etc.),
// so this just produces a clean local 0XXXXXXXXX value for our own storage
// and display, not a strict validator.
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/[^\d+]/g, '').replace(/^\+/, '')
  if (digits.startsWith('00972')) digits = digits.slice(5)
  else if (digits.startsWith('972')) digits = digits.slice(3)
  if (!digits.startsWith('0')) digits = '0' + digits

  if (digits.length < 9 || digits.length > 10) return null
  return digits
}
