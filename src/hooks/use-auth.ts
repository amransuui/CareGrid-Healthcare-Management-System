import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clearAuthSession,
  useAuthStore,
} from '@/store/use-auth-store'
import type { AuthSession } from '@/types/auth'

/** Reactive current demo session from the lightweight auth store. */
export function useSession(): AuthSession | null {
  return useAuthStore((state) => state.session)
}

/** Clears the demo session and returns to the guest area. */
export function useLogout() {
  const navigate = useNavigate()

  return useCallback(() => {
    clearAuthSession()
    navigate('/login', { replace: true })
  }, [navigate])
}