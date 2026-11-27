const SET_MESSAGES = ['כל הכבוד!', 'עבודה טובה!', 'ממשיכה חזק!', 'יפה מאוד!', 'עוד סט מאחורייך!']

// A short, random encouragement shown after every logged set, regardless of
// whether it's a personal record - simple positive feedback, every time
export function getSetEncouragement(): string {
  return SET_MESSAGES[Math.floor(Math.random() * SET_MESSAGES.length)]
}
