'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Dumbbell, Home, User } from 'lucide-react'

const tabs = [
  { href: '/dashboard', label: 'בית', icon: Home },
  { href: '/log', label: 'אימון', icon: Dumbbell },
  { href: '/progress', label: 'התקדמות', icon: BarChart2 },
  { href: '/profile', label: 'פרופיל', icon: User },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 right-0 left-0 z-50 bg-background border-t border-border">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
