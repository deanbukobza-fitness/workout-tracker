import MobileNav from '@/components/shared/MobileNav'

export default function AthleteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 overflow-auto pb-16">{children}</main>
      <MobileNav />
    </div>
  )
}
