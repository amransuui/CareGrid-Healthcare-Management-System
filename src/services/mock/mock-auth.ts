import {
  AuthServiceError,
  isAuthServiceError,
} from '@/services/auth'
import type { AuthService } from '@/services/auth'
import type { AuthSession, User } from '@/types/auth'
import { DEMO_PASSWORD, demoUsers } from '@/data/mock/demo-users'

/**
 * Frontend/demo-only authentication implementation.
 *
 * This exists so the full account UI can be built and tested before the
 * Spring Boot backend is available. It intentionally does NOT provide real
 * security — credentials live in plain sight and passwords are never
 * transmitted anywhere. Swap this file for an HTTP-based implementation of
 * `AuthService` when the backend lands.
 *
 * @see AuthService
 */

const SIMULATED_LATENCY_MS = 850

const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

const SESSION_TTL = {
  remember: 30 * 24 * 60 * 60 * 1000,
  session: 7 * 24 * 60 * 60 * 1000,
} as const

const normalizeEmail = (email: string) => email.trim().toLowerCase()

function buildToken(user: User): string {
  const random = Math.random().toString(36).slice(2, 10)
  return `demo.${user.id}.${random}`
}

function buildSession(user: User, remember: boolean): AuthSession {
  const issuedAt = new Date()
  const ttl = remember ? SESSION_TTL.remember : SESSION_TTL.session
  return {
    token: buildToken(user),
    user,
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + ttl).toISOString(),
    remember,
  }
}

export const mockAuthService: AuthService = {
  async login({ email, password, remember }) {
    await delay()

    const user = demoUsers.find(
      (candidate) => normalizeEmail(candidate.email) === normalizeEmail(email),
    )
    if (!user || password !== DEMO_PASSWORD) {
      throw new AuthServiceError(
        'invalid_credentials',
        'The email or password you entered is incorrect.',
        401,
      )
    }

    return buildSession(user, remember)
  },

  async register(data) {
    await delay()

    const emailExists = demoUsers.some(
      (candidate) => normalizeEmail(candidate.email) === normalizeEmail(data.email),
    )
    if (emailExists) {
      throw new AuthServiceError(
        'email_exists',
        'An account with this email already exists. Try logging in instead.',
        409,
      )
    }

    const user: User = {
      id: `usr_new_${Math.random().toString(36).slice(2, 8)}`,
      fullName: data.fullName.trim(),
      email: normalizeEmail(data.email),
      phone: data.phone.trim(),
      role: data.role,
    }

    // Demo flow: an in-memory session is created, nothing is persisted
    // to any backend. The account is intentionally not retained either.
    return buildSession(user, true)
  },

  async requestPasswordReset(_email: string) {
    await delay(600)

    // Always succeeds for any well-formed email — never reveals whether an
    // account exists. No email is actually sent; the UI explicitly
    // communicates that this is a demo flow.
  },
}

export { isAuthServiceError }