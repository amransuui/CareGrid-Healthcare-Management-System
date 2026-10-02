import { ArrowLeft } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { CareGridLogo } from '@/components/brand/caregrid-logo'
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'

/**
 * Dedicated chrome for the auth pages: slim brand bar + split layout with a
 * brand panel on desktop and a centered form column on mobile/tablet.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CareGridLogo />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft aria-hidden="true" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:justify-center lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <AuthBrandPanel />
          <div className="mx-auto flex w-full max-w-md justify-center lg:mx-0 lg:justify-end">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}