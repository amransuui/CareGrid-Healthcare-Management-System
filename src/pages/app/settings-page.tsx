import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Bell,
  Laptop,
  Lock,
  MonitorSmartphone,
  Palette,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Container } from '@/components/common/container'
import { DemoNotice } from '@/components/common/demo-notice'
import { ErrorState } from '@/components/common/error-state'
import { FormField } from '@/components/common/form-field'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PanelHeader } from '@/components/common/panel-header'
import { ProfilePanels } from '@/components/settings/profile-panels'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from '@/hooks/use-auth'
import { settingsService } from '@/services'
import { canManageOwnSettings } from '@/lib/roles'
import { formatDateTime } from '@/lib/clinical'
import { timeAgo } from '@/lib/time'
import {
  DENSITIES,
  LANGUAGES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_DELIVERY,
  NOTIFICATION_DELIVERY_LABELS,
  THEMES,
  type NotificationChannel,
  type NotificationDelivery,
  type UserPreferences,
} from '@/types/settings'

const THEME_LABELS: Record<(typeof THEMES)[number], string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Match system',
}

const DENSITY_LABELS: Record<(typeof DENSITIES)[number], string> = {
  comfortable: 'Comfortable',
  compact: 'Compact',
}

const LANGUAGE_LABELS: Record<(typeof LANGUAGES)[number], string> = {
  'en-GB': 'English (UK)',
  'bn-BD': 'বাংলা (Bangla)',
}

/**
 * Settings and account page. Profile and password live in `ProfilePanels`,
 * which seeds itself from the session profile; preferences, security and
 * sessions are frontend-only demo state.
 */
export function SettingsPage() {
  const session = useSession()
  const userId = session?.user.id ?? ''
  const mayEdit = canManageOwnSettings(session?.user.role)

  const [draft, setDraft] = useState<UserPreferences | null>(null)

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  })
  const profileQuery = useQuery({
    queryKey: ['settings', 'profile', userId],
    queryFn: () => settingsService.getProfile(userId),
    enabled: userId.length > 0,
  })

  const preferences = settingsQuery.data?.preferences
  const prefs = draft ?? preferences ?? null

  const preferencesMutation = useMutation({
    mutationFn: (next: UserPreferences) => settingsService.updatePreferences(next),
    onSuccess: async () => {
      setDraft(null)
      await settingsQuery.refetch()
    },
  })

  const securityMutation = useMutation({
    mutationFn: (next: Parameters<typeof settingsService.updateSecurity>[0]) =>
      settingsService.updateSecurity(next),
    onSuccess: async () => {
      await settingsQuery.refetch()
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => settingsService.revokeSession(sessionId),
    onSuccess: async () => {
      await settingsQuery.refetch()
    },
  })

  const sessionRows = useMemo(() => settingsQuery.data?.sessions ?? [], [settingsQuery.data])

  if (settingsQuery.isLoading || profileQuery.isLoading) {
    return (
      <Container size="fluid" className="max-w-5xl space-y-6 py-6">
        <PageSkeleton kpis={0} />
      </Container>
    )
  }

  if (settingsQuery.isError || !prefs) {
    return (
      <Container size="fluid" className="max-w-5xl space-y-6 py-6">
        <ErrorState
          title="Could not load settings"
          description="The demo settings snapshot could not be read. Please try again."
          onRetry={() => void settingsQuery.refetch()}
        />
      </Container>
    )
  }

  const dirty = draft !== null
  const security = settingsQuery.data?.security
  const issuedAt = settingsQuery.data?.sessionIssuedAt
  const passwordChangedAt = settingsQuery.data?.lastPasswordChangeAt

  return (
    <Container size="fluid" className="max-w-5xl space-y-6 py-6">
      <PageHeader
        title="Settings"
        description="Account, appearance, notifications and demo security for this workspace."
      />

      <DemoNotice
        tone="warning"
        title="Frontend-only settings"
        description="Profile edits, password changes and session revocation are simulated in the browser against fictional demo accounts. No credential is stored, transmitted or verified, and nothing here changes any real identity provider."
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <UserRound aria-hidden="true" className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette aria-hidden="true" className="size-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell aria-hidden="true" className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          {profileQuery.data ? (
            <ProfilePanels
              key={`${userId}:${profileQuery.data.email}`}
              profile={profileQuery.data}
              userId={userId}
              mayEdit={mayEdit}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <PanelHeader
                title="Appearance"
                description="Stored as demo preferences. Theme and density do not alter clinical meaning."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Theme" id="settings-theme">
                  <Select
                    value={prefs.theme}
                    onValueChange={(value) =>
                      setDraft({
                        ...prefs,
                        theme: value as UserPreferences['theme'],
                      })
                    }
                  >
                    <SelectTrigger id="settings-theme" aria-label="Theme preference">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THEMES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {THEME_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Language" id="settings-language">
                  <Select
                    value={prefs.language}
                    onValueChange={(value) =>
                      setDraft({
                        ...prefs,
                        language: value as UserPreferences['language'],
                      })
                    }
                  >
                    <SelectTrigger id="settings-language" aria-label="Language preference">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {LANGUAGE_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Table density" id="settings-density">
                  <Select
                    value={prefs.tableDensity}
                    onValueChange={(value) =>
                      setDraft({
                        ...prefs,
                        tableDensity: value as UserPreferences['tableDensity'],
                      })
                    }
                  >
                    <SelectTrigger id="settings-density" aria-label="Table density">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DENSITIES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {DENSITY_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                  <div className="min-w-0">
                    <Label htmlFor="settings-compact" className="text-sm">
                      Compact operational tables
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Reduce row height in wide operational tables for denser scanning.
                    </p>
                  </div>
                  <Switch
                    id="settings-compact"
                    checked={prefs.compactTables}
                    onCheckedChange={(checked) =>
                      setDraft({ ...prefs, compactTables: checked })
                    }
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                  <div className="min-w-0">
                    <Label htmlFor="settings-confirm" className="text-sm">
                      Confirm simulated clinical actions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Ask for confirmation before a state change in a workflow.
                    </p>
                  </div>
                  <Switch
                    id="settings-confirm"
                    checked={prefs.confirmDestructiveActions}
                    onCheckedChange={(checked) =>
                      setDraft({ ...prefs, confirmDestructiveActions: checked })
                    }
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                  <div className="min-w-0">
                    <Label htmlFor="settings-time-format" className="text-sm">
                      24-hour time
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Use 24-hour timestamps across record views.
                    </p>
                  </div>
                  <Switch
                    id="settings-time-format"
                    checked={prefs.timeFormat === '24h'}
                    onCheckedChange={(checked) =>
                      setDraft({ ...prefs, timeFormat: checked ? '24h' : '12h' })
                    }
                  />
                </div>
              </div>

              {dirty ? (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setDraft(null)}>
                    Discard
                  </Button>
                  <Button
                    disabled={preferencesMutation.isPending}
                    onClick={() => preferencesMutation.mutate(prefs)}
                  >
                    <Save aria-hidden="true" className="size-4" />
                    Save preferences
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardContent className="space-y-5 p-4 sm:p-5">
              <PanelHeader
                title="Notification channels"
                description="Choose which categories enter your in-app centre."
              />
              <ul className="divide-y rounded-lg border">
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <li key={channel} className="flex items-center justify-between gap-4 p-3">
                    <Label htmlFor={`channel-${channel}`} className="text-sm font-normal">
                      {NOTIFICATION_CHANNEL_LABELS[channel as NotificationChannel]}
                    </Label>
                    <Switch
                      id={`channel-${channel}`}
                      checked={prefs.channels[channel as NotificationChannel]}
                      onCheckedChange={(checked) =>
                        setDraft({
                          ...prefs,
                          channels: { ...prefs.channels, [channel]: checked },
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <PanelHeader
                title="Delivery"
                description="Demo delivery switches. No email or SMS is ever sent."
              />
              <ul className="divide-y rounded-lg border">
                {NOTIFICATION_DELIVERY.map((delivery) => (
                  <li key={delivery} className="flex items-center justify-between gap-4 p-3">
                    <div className="min-w-0">
                      <Label
                        htmlFor={`delivery-${delivery}`}
                        className="text-sm font-normal"
                      >
                        {NOTIFICATION_DELIVERY_LABELS[delivery as NotificationDelivery]}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {delivery === 'sms'
                          ? 'Simulated only — no gateway is configured.'
                          : delivery === 'email'
                            ? 'Simulated only — no mail server is configured.'
                            : 'Feeds the in-app notification centre.'}
                      </p>
                    </div>
                    <Switch
                      id={`delivery-${delivery}`}
                      checked={prefs.delivery[delivery as NotificationDelivery]}
                      onCheckedChange={(checked) =>
                        setDraft({
                          ...prefs,
                          delivery: { ...prefs.delivery, [delivery]: checked },
                        })
                      }
                    />
                  </li>
                ))}
              </ul>

              {dirty ? (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setDraft(null)}>
                    Discard
                  </Button>
                  <Button
                    disabled={preferencesMutation.isPending}
                    onClick={() => preferencesMutation.mutate(prefs)}
                  >
                    <Save aria-hidden="true" className="size-4" />
                    Save notification preferences
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <PanelHeader
                title="Workspace security"
                description="Simulated safeguards. None of these are enforced by a backend."
              />
              {security ? (
                <>
                  <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                    <div className="min-w-0">
                      <Label htmlFor="settings-pin" className="text-sm">
                        Require a PIN for exports
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Simulated extra confirmation on sensitive screens.
                      </p>
                    </div>
                    <Switch
                      id="settings-pin"
                      checked={security.requirePinForExport}
                      onCheckedChange={(checked) =>
                        securityMutation.mutate({ ...security, requirePinForExport: checked })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                    <div className="min-w-0">
                      <Label htmlFor="settings-new-device" className="text-sm">
                        Notify on a new device
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Surfaced as a demo notification only.
                      </p>
                    </div>
                    <Switch
                      id="settings-new-device"
                      checked={security.notifyOnNewDevice}
                      onCheckedChange={(checked) =>
                        securityMutation.mutate({ ...security, notifyOnNewDevice: checked })
                      }
                    />
                  </div>

                  <FormField
                    label="Auto-lock after inactivity"
                    id="settings-autolock"
                    hint="Cosmetic in this demo."
                  >
                    <Select
                      value={String(security.autoLockMinutes)}
                      onValueChange={(value) =>
                        securityMutation.mutate({
                          ...security,
                          autoLockMinutes: Number(value) as 0 | 5 | 15 | 30,
                        })
                      }
                    >
                      <SelectTrigger id="settings-autolock" aria-label="Auto-lock delay">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Never</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <PanelHeader
                title="Active sessions"
                description={`Fictional sessions for the demo workspace · issued ${
                  issuedAt ? formatDateTime(issuedAt) : 'recently'
                }`}
                actions={
                  <MonitorSmartphone aria-hidden="true" className="size-4 text-muted-foreground" />
                }
              />
              <ul className="divide-y rounded-lg border">
                {sessionRows.map((row) => (
                  <li key={row.id} className="flex flex-wrap items-start gap-3 p-3">
                    <Laptop
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {row.device}
                        {row.current ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            This session
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.browser} · {row.location} · {row.ip}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active {timeAgo(row.lastActiveAt)}
                      </p>
                    </div>
                    {!row.current ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={revokeMutation.isPending}
                        onClick={() => revokeMutation.mutate(row.id)}
                        aria-label={`Revoke ${row.device} session`}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        Revoke
                      </Button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock aria-hidden="true" className="size-3.5" />
                        Locked
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Password last changed{' '}
                {passwordChangedAt ? formatDateTime(passwordChangedAt) : 'not recorded'} in the demo
                store.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  )
}
