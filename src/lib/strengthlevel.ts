// Parses the "By Bodyweight" standards table from a strengthlevel.com exercise
// page (female section, kg units) - a plain, consistently-shaped HTML table of
// bodyweight brackets x 5 strength levels (Beginner..Elite), fetched fresh each
// sync rather than stored anywhere in this repo.

export interface BodyweightBracket {
  bodyweightKg: number
  // minWeight per level, in levelOrder 1-5 (Beginner, Novice, Intermediate, Advanced, Elite)
  levels: [number, number, number, number, number]
}

const ROW_RE =
  /<tr><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><\/tr>/g

export function parseFemaleBodyweightBrackets(html: string): BodyweightBracket[] | null {
  // This exact marker (not the shorter "tabs-by-weight-and-age-panel-1", which
  // also matches an aria-controls reference right next to it) appears once per
  // gender section, in document order (Male, then Female) - the second match
  // is the Female one.
  const panelMarker = 'id="tabs-by-weight-and-age-panel-1" class="tab"'
  const firstPanel = html.indexOf(panelMarker)
  if (firstPanel === -1) return null
  const secondPanel = html.indexOf(panelMarker, firstPanel + panelMarker.length)
  if (secondPanel === -1) return null // only one gender section found - page shape changed

  const tableStart = html.indexOf('<tbody>', secondPanel)
  const tableEnd = html.indexOf('</tbody>', tableStart)
  if (tableStart === -1 || tableEnd === -1) return null

  const section = html.slice(tableStart, tableEnd)
  const brackets: BodyweightBracket[] = []
  for (const m of section.matchAll(ROW_RE)) {
    const [, bw, beg, nov, int, adv, elite] = m
    brackets.push({
      bodyweightKg: Number(bw),
      levels: [Number(beg), Number(nov), Number(int), Number(adv), Number(elite)],
    })
  }
  return brackets.length > 0 ? brackets : null
}

export async function fetchFemaleBodyweightBrackets(slug: string): Promise<BodyweightBracket[]> {
  const res = await fetch(`https://strengthlevel.com/strength-standards/${slug}/kg`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) {
    throw new Error(`strengthlevel.com החזיר ${res.status} עבור "${slug}" - בדקי שה-slug נכון`)
  }
  const html = await res.text()
  const brackets = parseFemaleBodyweightBrackets(html)
  if (!brackets) {
    throw new Error('לא הצלחתי לפרש את טבלת הרמות בעמוד - ייתכן שמבנה האתר השתנה')
  }
  return brackets
}
