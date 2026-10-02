import { Link } from 'react-router-dom'
import { BedDouble, CalendarClock, UserRound } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BedStatusBadge } from '@/components/clinical/clinical-status-badge'
import type { Bed, BedStatus, Patient } from '@/types/clinical'
import { formatDateTime } from '@/lib/clinical'
import { timeAgo } from '@/lib/time'
import { userInitials } from '@/lib/utils'

type BedAction = BedStatus

interface BedDetailsDrawerProps {
  bed: Bed | null
  patient: Patient | null
  open: boolean
  busy: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus: (status: BedAction) => void
}

/** Bed detail drawer with demo status transitions and occupant context. */
export function BedDetailsDrawer({
  bed,
  patient,
  open,
  busy,
  onOpenChange,
  onUpdateStatus,
}: BedDetailsDrawerProps) {
  const actions: Array<{ status: BedAction; label: string }> = [
    { status: 'available', label: 'Available' },
    { status: 'cleaning', label: 'Cleaning' },
    { status: 'reserved', label: 'Reserved' },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex items-center gap-2">
            <BedDouble aria-hidden="true" className="size-4 text-primary" />
            {bed ? `${bed.number} · ${bed.ward}` : 'Bed'}
          </SheetTitle>
          <SheetDescription>
            {bed ? (
              <>
                Status:{' '}
                <BedStatusBadge status={bed.status} className="align-middle" />
              </>
            ) : (
              'No bed selected'
            )}
          </SheetDescription>
        </SheetHeader>

        {bed ? (
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="text-right tabular-nums">
                  {formatDateTime(bed.lastUpdated)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Last cleaned</dt>
                <dd className="text-right tabular-nums">
                  {bed.lastCleaned ? timeAgo(bed.lastCleaned) : '—'}
                </dd>
              </div>
            </dl>

            <Separator />

            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
                Assigned patient
              </h3>
              {patient ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                      aria-hidden="true"
                    >
                      {userInitials(patient.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{patient.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.patientId} · {patient.bloodGroup} · {patient.department}
                      </p>
                      <Button asChild variant="link" size="sm" className="h-auto px-0 text-xs">
                        <Link to={`/app/patients/${patient.patientId}`}>Open record</Link>
                      </Button>
                    </div>
                  </div>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Admitted</dt>
                      <dd className="text-right tabular-nums">
                        {formatDateTime(patient.admissionDate)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Assigned doctor</dt>
                      <dd className="text-right">{patient.attendingDoctor}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Assigned nurse</dt>
                      <dd className="text-right">{patient.assignedNurse}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Clinical summary
                    </p>
                    <p className="mt-1 text-sm">{patient.diagnosis}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {bed.status === 'occupied'
                    ? 'Occupant details unavailable.'
                    : 'No patient assigned to this bed.'}
                </p>
              )}
            </div>

            {bed.status !== 'occupied' ? (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                    <CalendarClock aria-hidden="true" className="size-4 text-muted-foreground" />
                    Update status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {actions.map(({ status, label }) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={bed.status === status ? 'outline' : 'secondary'}
                        disabled={busy || bed.status === status}
                        onClick={() => onUpdateStatus(status)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Demo transition — no real bed is affected.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        <SheetFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}