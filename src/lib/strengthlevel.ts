// Parses the "By Bodyweight" and "By Age" standards tables from a
// strengthlevel.com exercise page (female section, kg units) - plain,
// consistently-shaped HTML tables, fetched fresh each sync rather than
// stored anywhere in this repo.

export interface BodyweightBracket {
  bodyweightKg: number
  // minWeight per level, in levelOrder 1-5 (Beginner, Novice, Intermediate, Advanced, Elite)
  levels: [number, number, number, number, number]
}

export interface AgeBracket {
  ageYears: number
  // minWeight per level, in levelOrder 1-5 (Beginner, Novice, Intermediate, Advanced, Elite)
  levels: [number, number, number, number, number]
}

const ROW_RE =
  /<tr><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><td>(\d+(?:\.\d+)?)<\/td><\/tr>/g

// Finds the second occurrence of a panel marker (Male section comes first,
// then Female) and parses its <tbody> rows as [x, Beg, Nov, Int, Adv, Elite].
function parseSecondPanelRows(html: string, panelMarker: string): [number, number, number, number, number, number][] | null {
  const firstPanel = html.indexOf(panelMarker)
  if (firstPanel === -1) return null
  const secondPanel = html.indexOf(panelMarker, firstPanel + panelMarker.length)
  if (secondPanel === -1) return null // only one gender section found - page shape changed

  const tableStart = html.indexOf('<tbody>', secondPanel)
  const tableEnd = html.indexOf('</tbody>', tableStart)
  if (tableStart === -1 || tableEnd === -1) return null

  const section = html.slice(tableStart, tableEnd)
  const rows: [number, number, number, number, number, number][] = []
  for (const m of section.matchAll(ROW_RE)) {
    const [, a, b, c, d, e, f] = m
    rows.push([Number(a), Number(b), Number(c), Number(d), Number(e), Number(f)])
  }
  return rows.length > 0 ? rows : null
}

export function parseFemaleBodyweightBrackets(html: string): BodyweightBracket[] | null {
  // This exact marker (not the shorter "tabs-by-weight-and-age-panel-1", which
  // also matches an aria-controls reference right next to it) appears once per
  // gender section, in document order (Male, then Female) - the second match
  // is the Female one.
  const rows = parseSecondPanelRows(html, 'id="tabs-by-weight-and-age-panel-1" class="tab"')
  if (!rows) return null
  return rows.map(([bw, beg, nov, int, adv, elite]) => ({
    bodyweightKg: bw,
    levels: [beg, nov, int, adv, elite],
  }))
}

export function parseFemaleAgeBrackets(html: string): AgeBracket[] | null {
  // Same shape as the bodyweight tab, just the second tab panel on the page
  // ("By Age") instead of the first ("By Bodyweight") - same Male-then-Female
  // ordering, second occurrence = Female.
  const rows = parseSecondPanelRows(html, 'id="tabs-by-weight-and-age-panel-2"')
  if (!rows) return null
  return rows.map(([age, beg, nov, int, adv, elite]) => ({
    ageYears: age,
    levels: [beg, nov, int, adv, elite],
  }))
}

async function fetchExercisePage(slug: string): Promise<string> {
  const res = await fetch(`https://strengthlevel.com/strength-standards/${slug}/kg`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) {
    throw new Error(`strengthlevel.com החזיר ${res.status} עבור "${slug}" - בדקי שה-slug נכון`)
  }
  return res.text()
}

export async function fetchFemaleBodyweightBrackets(slug: string): Promise<BodyweightBracket[]> {
  const html = await fetchExercisePage(slug)
  const brackets = parseFemaleBodyweightBrackets(html)
  if (!brackets) {
    throw new Error('לא הצלחתי לפרש את טבלת הרמות לפי משקל גוף - ייתכן שמבנה האתר השתנה')
  }
  return brackets
}

export async function fetchFemaleAgeBrackets(slug: string): Promise<AgeBracket[]> {
  const html = await fetchExercisePage(slug)
  const brackets = parseFemaleAgeBrackets(html)
  if (!brackets) {
    throw new Error('לא הצלחתי לפרש את טבלת הרמות לפי גיל - ייתכן שמבנה האתר השתנה')
  }
  return brackets
}
