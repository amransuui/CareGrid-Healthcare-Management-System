import type {
  AuthSession,
  LoginCredentials,
  RegisterData,
} from '@/types/auth'
import { ServiceError } from '@/services/service-error'

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_exists'
  | 'email_not_found'
  | 'service_unavailable'

/**
 * Domain error thrown by auth operations. `code` lets the UI branch on
 * outcomes (e.g. "existing email") without knowing anything about transport.
 */
export class AuthServiceError extends ServiceError {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string, status = 401) {
    super(message, status)
    this.name = 'AuthServiceError'
    this.code = code
  }
}

/**
 * Authentication contract for the UI. The current implementation is a
 * mock demo service (`@/services/mock/mock-auth`); a future Spring Boot
 * REST client can implement the same interface with no UI changes.
 */
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>
  register(data: RegisterData): Promise<AuthSession>
  requestPasswordReset(email: string): Promise<void>
}

export const isAuthServiceError = (error: unknown): error is AuthServiceError =>
  error instanceof AuthServiceError