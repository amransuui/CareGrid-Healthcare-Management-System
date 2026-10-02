import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Save } from 'lucide-react'
import { FormField } from '@/components/common/form-field'
import { PanelHeader } from '@/components/common/panel-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { settingsService } from '@/services'
import { USER_ROLES, type User, type UserRole } from '@/types/auth'

const ROLE_LABELS: Record<UserRole, string> = {
  doctor: 'Doctor',
  nurse: 'Nurse',
  blood_bank_coordinator: 'Blood bank coordinator',
  pharmacist: 'Pharmacist',
  billing_officer: 'Billing officer',
  patient_family: 'Patient / family',
}

interface ProfilePanelsProps {
  /** Profile resolved for the current session; seeds the form fields. */
  profile: User
  userId: string
  mayEdit: boolean
}

/**
 * Profile and password panels. Local state is initialised straight from the
 * `profile` prop, and the parent remounts this component (via `key`) whenever a
 * different profile is loaded — so no effect is needed to sync the inputs.
 */
export function ProfilePanels({ profile, userId, mayEdit }: ProfilePanelsProps) {
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState(profile.fullName)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [role, setRole] = useState<UserRole>(profile.role)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const profileMutation = useMutation({
    mutationFn: () => settingsService.updateProfile(userId, { fullName, email, phone, role }),
    onSuccess: async () => {
      setProfileMessage('Profile updated in the demo store.')
      await queryClient.invalidateQueries({ queryKey: ['settings', 'profile', userId] })
    },
    onError: (error: unknown) => {
      setProfileMessage(
        error instanceof Error ? error.message : 'The profile could not be updated.',
      )
    },
  })

  const passwordMutation = useMutation({
    mutationFn: () =>
      settingsService.changePassword(userId, { currentPassword, newPassword, confirmPassword }),
    onSuccess: async () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password changed in the demo store only.')
      await queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (error: unknown) => {
      setPasswordMessage(
        error instanceof Error ? error.message : 'The password could not be changed.',
      )
    },
  })

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <PanelHeader
            title="Your profile"
            description="Bound to the current demo session. Nothing is sent to a server."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name" id="settings-full-name" required>
              <Input
                id="settings-full-name"
                value={fullName}
                disabled={!mayEdit}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
              />
            </FormField>
            <FormField label="Email" id="settings-email" required>
              <Input
                id="settings-email"
                type="email"
                value={email}
                disabled={!mayEdit}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </FormField>
            <FormField label="Phone" id="settings-phone" hint="Optional">
              <Input
                id="settings-phone"
                type="tel"
                value={phone}
                disabled={!mayEdit}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </FormField>
            <FormField
              label="Role"
              id="settings-role"
              hint="Demo only — role changes are not permission grants."
            >
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={!mayEdit}
              >
                <SelectTrigger id="settings-role" aria-label="Demo role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {ROLE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {profileMessage ? (
            <p role="status" className="text-sm text-muted-foreground">
              {profileMessage}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              disabled={!mayEdit || profileMutation.isPending}
              onClick={() => profileMutation.mutate()}
            >
              <Save aria-hidden="true" className="size-4" />
              Save profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <PanelHeader
            title="Password"
            description="Simulated validation only. Use any value of 4+ characters for the current password."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Current password" id="settings-current-password">
              <Input
                id="settings-current-password"
                type="password"
                value={currentPassword}
                disabled={!mayEdit}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
              />
            </FormField>
            <div className="hidden sm:block" aria-hidden="true" />
            <FormField
              label="New password"
              id="settings-new-password"
              hint="At least 10 characters."
            >
              <Input
                id="settings-new-password"
                type="password"
                value={newPassword}
                disabled={!mayEdit}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Confirm new password" id="settings-confirm-password">
              <Input
                id="settings-confirm-password"
                type="password"
                value={confirmPassword}
                disabled={!mayEdit}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </FormField>
          </div>

          {passwordMessage ? (
            <p role="status" className="text-sm text-muted-foreground">
              {passwordMessage}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              disabled={!mayEdit || passwordMutation.isPending}
              onClick={() => passwordMutation.mutate()}
            >
              <KeyRound aria-hidden="true" className="size-4" />
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
