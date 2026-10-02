import { demoUsers } from '@/data/mock/demo-users'
import { buildSettingsSnapshot } from '@/data/mock/settings'
import type { SettingsService } from '@/services/settings'
import type {
  PasswordChangeInput,
  ProfileUpdateInput,
  SecurityPreferences,
  SettingsSnapshot,
  UserPreferences,
} from '@/types/settings'
import type { User } from '@/types/auth'

/**
 * Frontend-only settings implementation. Profile edits, password changes and
 * session revocation are simulated against the fictional demo accounts — no
 * credential is stored, transmitted or verified against any identity provider.
 */

const profiles = new Map<string, User>(demoUsers.map((user) => [user.id, { ...user }]))

let snapshot: SettingsSnapshot = buildSettingsSnapshot()

function cloneSnapshot(): SettingsSnapshot {
  return {
    ...snapshot,
    preferences: {
      ...snapshot.preferences,
      channels: { ...snapshot.preferences.channels },
      delivery: { ...snapshot.preferences.delivery },
    },
    security: { ...snapshot.security },
    sessions: snapshot.sessions.map((session) => ({ ...session })),
  }
}

export const mockSettingsService: SettingsService = {
  async getSettings() {
    return cloneSnapshot()
  },

  async getProfile(userId) {
    const profile = profiles.get(userId)
    return profile ? { ...profile } : null
  },

  async updateProfile(userId, input: ProfileUpdateInput) {
    const existing = profiles.get(userId)
    if (!existing) throw new Error('Profile not found for this demo account.')
    const updated: User = {
      ...existing,
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: input.role,
    }
    profiles.set(userId, updated)
    return { ...updated }
  },

  async changePassword(userId, input: PasswordChangeInput) {
    if (!profiles.has(userId)) throw new Error('Profile not found for this demo account.')
    if (input.currentPassword.trim().length < 4) {
      throw new Error('Enter the current password to continue.')
    }
    if (input.newPassword.length < 10) {
      throw new Error('Use at least 10 characters for the demo password.')
    }
    if (input.newPassword !== input.confirmPassword) {
      throw new Error('The two passwords do not match.')
    }
    if (input.newPassword === input.currentPassword) {
      throw new Error('The new password must differ from the current one.')
    }
    const changedAt = new Date().toISOString()
    snapshot = { ...snapshot, lastPasswordChangeAt: changedAt }
    return { changedAt }
  },

  async updatePreferences(preferences: UserPreferences) {
    snapshot = {
      ...snapshot,
      preferences: {
        ...preferences,
        channels: { ...preferences.channels },
        delivery: { ...preferences.delivery },
      },
    }
    return { ...snapshot.preferences }
  },

  async updateSecurity(preferences: SecurityPreferences) {
    snapshot = { ...snapshot, security: { ...preferences } }
    return { ...snapshot.security }
  },

  async revokeSession(sessionId: string) {
    if (snapshot.sessions.find((session) => session.id === sessionId)?.current) {
      throw new Error('You cannot revoke the session you are currently using.')
    }
    snapshot = {
      ...snapshot,
      sessions: snapshot.sessions.filter((session) => session.id !== sessionId),
    }
    return cloneSnapshot()
  },
}
