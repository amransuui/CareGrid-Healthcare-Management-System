import type {
  PasswordChangeInput,
  ProfileUpdateInput,
  SecurityPreferences,
  SettingsSnapshot,
  UserPreferences,
} from '@/types/settings'
import type { User } from '@/types/auth'

/**
 * Settings service contract. The Spring Boot backend will own the profile and
 * credential changes; the mock only simulates them in memory. The signed-in
 * user id is passed explicitly so a future authenticated client resolves the
 * same contract.
 */
export interface SettingsService {
  getSettings(): Promise<SettingsSnapshot>
  getProfile(userId: string): Promise<User | null>
  updateProfile(userId: string, input: ProfileUpdateInput): Promise<User>
  changePassword(userId: string, input: PasswordChangeInput): Promise<{ changedAt: string }>
  updatePreferences(preferences: UserPreferences): Promise<UserPreferences>
  updateSecurity(preferences: SecurityPreferences): Promise<SecurityPreferences>
  revokeSession(sessionId: string): Promise<SettingsSnapshot>
}
