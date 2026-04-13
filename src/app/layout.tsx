import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
})

export const metadata: Metadata = {
  title: 'מעקב אימונים — סטודיו כוח לנשים',
  description: 'מערכת מעקב התקדמות לאימוני כוח',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-[family-name:var(--font-heebo)]">
        {children}
      </body>
    </html>
  )
}
