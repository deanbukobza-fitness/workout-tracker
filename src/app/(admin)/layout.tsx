import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'לוח בקרה' },
  { href: '/admin/exercises', label: 'תרגילים' },
  { href: '/admin/key-exercises', label: 'תרגילי מפתח' },
  { href: '/admin/athletes', label: 'מתאמנות' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-pink-600 text-lg">💪 ניהול סטודיו</span>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            התנתקות
          </button>
        </form>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden border-b border-border bg-card overflow-x-auto">
        <div className="flex px-4">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
