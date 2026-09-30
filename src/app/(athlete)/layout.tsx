import MobileNav from '@/components/shared/MobileNav'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function AthleteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (session?.user.role === 'KIOSK') redirect('/kiosk')

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 overflow-auto pb-16">{children}</main>
      <MobileNav />
    </div>
  )
}
