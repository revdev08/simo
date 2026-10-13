import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import NavLinks from './NavLinks'
import AccountMenu, { type SubscriptionStatus } from './AccountMenu'

// Marco común de las páginas internas: barra superior con navegación y cuenta
export default function DashboardShell({
  children,
  email,
  name,
  subscription,
}: {
  children: React.ReactNode
  email: string
  name?: string | null
  subscription: SubscriptionStatus
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0" aria-label="SIMO Test, inicio">
            <Image src="/logo.png" alt="" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="hidden sm:inline font-bold tracking-tight text-slate-900 dark:text-white">SIMO Test</span>
          </Link>
          <NavLinks />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AccountMenu email={email} name={name} subscription={subscription} />
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
    </div>
  )
}
