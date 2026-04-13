import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@studio.co.il' },
    update: {},
    create: {
      email: 'admin@studio.co.il',
      name: 'מנהלת הסטודיו',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

  // Demo athlete
  const athleteHash = await bcrypt.hash('athlete123', 12)
  await prisma.user.upsert({
    where: { email: 'demo@studio.co.il' },
    update: {},
    create: {
      email: 'demo@studio.co.il',
      name: 'שרה כהן',
      passwordHash: athleteHash,
      role: 'ATHLETE',
    },
  })

  // Exercises
  const exercises = [
    {
      name: 'סקוואט',
      notes: 'עמדי עם הרגליים ברוחב הכתפיים. הורידי את האגן עד לקו הברכיים. שמרי על הגב ישר.',
      youtubeUrl: null,
      benchmarks: [
        { label: 'מתחילה', minWeight: 15, levelOrder: 1 },
        { label: 'מתחילה+', minWeight: 40, levelOrder: 2 },
        { label: 'ביניים', minWeight: 65, levelOrder: 3 },
        { label: 'ביניים+', minWeight: 80, levelOrder: 4 },
        { label: 'מתקדמת', minWeight: 100, levelOrder: 5 },
      ],
    },
    {
      name: 'דדליפט',
      notes: 'רגליים ברוחב הכתפיים. אחזי בבר, שמרי על הגב ישר, הרמי מהרצפה בכוח הרגליים.',
      youtubeUrl: null,
      benchmarks: [
        { label: 'מתחילה', minWeight: 20, levelOrder: 1 },
        { label: 'מתחילה+', minWeight: 50, levelOrder: 2 },
        { label: 'ביניים', minWeight: 80, levelOrder: 3 },
        { label: 'ביניים+', minWeight: 100, levelOrder: 4 },
        { label: 'מתקדמת', minWeight: 120, levelOrder: 5 },
      ],
    },
    {
      name: 'לחיצת חזה',
      notes: 'שכבי על הספסל. אחזי בבר מעט מחוץ לרוחב הכתפיים. הורידי לחזה והעלי.',
      youtubeUrl: null,
      benchmarks: [
        { label: 'מתחילה', minWeight: 10, levelOrder: 1 },
        { label: 'מתחילה+', minWeight: 25, levelOrder: 2 },
        { label: 'ביניים', minWeight: 40, levelOrder: 3 },
        { label: 'ביניים+', minWeight: 55, levelOrder: 4 },
        { label: 'מתקדמת', minWeight: 70, levelOrder: 5 },
      ],
    },
    {
      name: 'מתח (Chin-Up)',
      notes: 'אחזי בבר ברוחב הכתפיים, כפות הידיים לכיוונך. משכי את הגוף למעלה עד לסנטר מעל הבר.',
      youtubeUrl: null,
      benchmarks: [
        { label: 'מתחילה', minWeight: 0, levelOrder: 1 },
        { label: 'מתחילה+', minWeight: 5, levelOrder: 2 },
        { label: 'ביניים', minWeight: 15, levelOrder: 3 },
        { label: 'ביניים+', minWeight: 25, levelOrder: 4 },
        { label: 'מתקדמת', minWeight: 40, levelOrder: 5 },
      ],
    },
    {
      name: 'לחיצת כתפיים',
      notes: 'עמדי או שבי זקופה. הרמי משקולות ממפלס הכתפיים ישר למעלה עד ישור הידיים.',
      youtubeUrl: null,
      benchmarks: [
        { label: 'מתחילה', minWeight: 5, levelOrder: 1 },
        { label: 'מתחילה+', minWeight: 15, levelOrder: 2 },
        { label: 'ביניים', minWeight: 25, levelOrder: 3 },
        { label: 'ביניים+', minWeight: 35, levelOrder: 4 },
        { label: 'מתקדמת', minWeight: 45, levelOrder: 5 },
      ],
    },
    {
      name: 'כפיפת מרפקים (Bicep Curl)',
      notes: 'עמדי זקופה. כפי את הידיים כלפי מעלה תוך שמירה על מרפקים ליד הגוף.',
      youtubeUrl: null,
      benchmarks: [
        { label: 'מתחילה', minWeight: 5, levelOrder: 1 },
        { label: 'מתחילה+', minWeight: 12, levelOrder: 2 },
        { label: 'ביניים', minWeight: 20, levelOrder: 3 },
        { label: 'ביניים+', minWeight: 28, levelOrder: 4 },
        { label: 'מתקדמת', minWeight: 35, levelOrder: 5 },
      ],
    },
  ]

  for (const ex of exercises) {
    const { benchmarks, ...data } = ex
    const existing = await prisma.exercise.findFirst({ where: { name: ex.name } })
    if (!existing) {
      await prisma.exercise.create({
        data: {
          ...data,
          benchmarks: { create: benchmarks },
        },
      })
    }
  }

  console.log('✅ Seed complete')
  console.log('   Admin: admin@studio.co.il / admin123')
  console.log('   Athlete: demo@studio.co.il / athlete123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
