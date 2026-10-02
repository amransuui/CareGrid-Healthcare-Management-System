import { UserRoundCheck } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  SafetyAlertSeverityBadge,
  SafetyAlertStatusBadge,
  SafetyAlertTypeBadge,
} from '@/components/pharmacy/pharmacy-status-badges'
import {
  SAFETY_ALERT_STATUS_LABELS,
  type SafetyAlert,
  type SafetyAlertStatus,
} from '@/types/pharmacy'
import { formatDateTime } from '@/lib/clinical'

interface AlertDrawerProps {
  alert: SafetyAlert | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (alert: SafetyAlert, status: SafetyAlertStatus) => void
}

/** Safety alert detail with resolution actions. */
export function AlertDrawer({ alert, busy, onOpenChange, onStatusChange }: AlertDrawerProps) {
  if (!alert) return null

  const action = (
    status: SafetyAlertStatus,
    label: string,
    variant: 'default' | 'outline' | 'ghost' = 'outline',
  ) => (
    <Button
      variant={variant}
      size="sm"
      disabled={busy || alert.status === status}
      onClick={() => onStatusChange(alert, status)}
    >
      {label}
    </Button>
  )

  return (
    <Sheet open={Boolean(alert)} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <SheetTitle className="text-lg">{alert.subject}</SheetTitle>
            <SafetyAlertStatusBadge status={alert.status} />
          </div>
          <SheetDescription>
            {alert.alertId} · created {formatDateTime(alert.createdAt)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <SafetyAlertTypeBadge type={alert.type} />
            <SafetyAlertSeverityBadge severity={alert.severity} />
          </div>

          <dl className="grid gap-3">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Medicine</dt>
              <dd className="text-sm font-medium">{alert.medication ?? '—'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Patient</dt>
              <dd className="text-sm font-medium">{alert.patientId ?? '—'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Assigned to</dt>
              <dd className="inline-flex items-center gap-1.5 text-sm font-medium">
                <UserRoundCheck aria-hidden="true" className="size-4 text-muted-foreground" />
                {alert.assignedRole}
              </dd>
            </div>
          </dl>

          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-sm leading-relaxed">{alert.context}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Status preview: {SAFETY_ALERT_STATUS_LABELS[alert.status]}. Actions below update the
            demo alert lifecycle only.
          </p>
        </div>

        <SheetFooter className="border-t px-6 py-4 sm:justify-end">
          {alert.status === 'new' || alert.status === 'reviewing' ? action('resolved', 'Mark resolved') : null}
          {alert.status === 'new' ? action('reviewing', 'Start review') : null}
          {alert.status === 'new' || alert.status === 'reviewing' ? action('dismissed', 'Dismiss', 'ghost') : null}
          {alert.status === 'resolved' || alert.status === 'dismissed' ? action('new', 'Reopen') : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}