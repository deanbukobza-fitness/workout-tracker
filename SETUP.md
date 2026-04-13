# הגדרת המערכת — מדריך התקנה

## שלב 1: מסד נתונים (Neon)

1. היכנסי לאתר [neon.tech](https://neon.tech) וצרי חשבון חינמי
2. צרי פרויקט חדש (בחרי אזור גיאוגרפי קרוב — לדוגמה Europe)
3. העתיקי את ה-**Connection String** (נראה כך: `postgresql://user:password@host/db?sslmode=require`)

## שלב 2: משתני סביבה

עדכני את קובץ `.env` בתיקיית הפרויקט:

```bash
DATABASE_URL="postgresql://YOUR_NEON_CONNECTION_STRING"
AUTH_SECRET="YOUR_RANDOM_SECRET"
```

לייצור סיסמה רנדומלית עבור `AUTH_SECRET`, הריצי:
```bash
openssl rand -base64 32
```

## שלב 3: מיגרציה של מסד הנתונים

```bash
cd workout-tracker
npx prisma migrate dev --name init
```

## שלב 4: נתוני בסיס (Seed)

```bash
npm run db:seed
```

זה ייצור:
- **מנהלת**: `admin@studio.co.il` / `admin123`
- **מתאמנת דמו**: `demo@studio.co.il` / `athlete123`
- 6 תרגילים עם רמות מוגדרות

**חשוב**: החלפי את הסיסמה `admin123` מיד לאחר הכניסה הראשונה!

## שלב 5: פריסה ל-Vercel

1. [צרי חשבון Vercel](https://vercel.com) (חינמי)
2. חברי את קובץ הפרויקט ל-GitHub (או גררי ישירות)
3. ב-Vercel, הוסיפי את משתני הסביבה:
   - `DATABASE_URL`
   - `AUTH_SECRET`
4. Vercel תבנה ותפרוס אוטומטית

## הרצה מקומית

```bash
cd workout-tracker
npm run dev
# פתחי http://localhost:3000
```

## פקודות שימושיות

```bash
npm run db:studio     # ממשק גרפי למסד הנתונים
npm run db:seed       # טעינת נתוני בסיס מחדש
npx prisma migrate dev # מיגרציה חדשה לאחר שינוי schema
```

---

## מבנה התפריטים

### מנהלת (כניסה עם role=ADMIN)
- `/admin` — לוח בקרה: שיאים, פעילות, לא פעילות
- `/admin/exercises` — ניהול תרגילים + רמות + YouTube
- `/admin/key-exercises` — בחירת 4 תרגילי מפתח חודשיים
- `/admin/athletes` — טבלת מתאמנות עם סטטוס

### מתאמנות
- `/dashboard` — דשבורד ראשי עם תרגילי מפתח
- `/log` — בחירת תרגיל לרישום
- `/log/[exerciseId]` — רישום סטים (+ קונפטי על שיא!)
- `/progress/[exerciseId]` — גרפי התקדמות + מד רמה
- `/profile` — פרופיל אישי

## יצירת מנהלת נוספת

```sql
-- ב-Prisma Studio או ישירות ב-Neon:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'youremail@example.com';
```
