import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { CareGridLogo } from '@/components/brand/caregrid-logo'
import {
  clearAuthSession,
  sessionIsValid,
  useAuthStore,
} from '@/store/use-auth-store'

function AuthLoading() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-3 text-muted-foreground"
      role="status"
    >
      <CareGridLogo />
      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      <span className="sr-only">Checking your session</span>
    </div>
  )
}

/**
 * Blocks unauthenticated access. Renders children only when a valid demo
 * session exists; otherwise sends the visitor to `/login` remembering where
 * they were headed.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session)
  const hydrated = useAuthStore((state) => state.hydrated)
  const location = useLocation()

  if (!hydrated) return <AuthLoading />

  if (!sessionIsValid(session)) {
    if (session) clearAuthSession()
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return <>{children}</>
}

/**
 * Blocks authenticated users from guest pages. A visitor with a valid demo
 * session on `/login`, `/register` or `/forgot-password` lands on `/app`.
 */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session)
  const hydrated = useAuthStore((state) => state.hydrated)

  if (!hydrated) return <AuthLoading />

  if (sessionIsValid(session)) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}