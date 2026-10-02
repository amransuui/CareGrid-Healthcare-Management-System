import { CheckCircle2, Droplets, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  RequestStatusBadge,
  RequestUrgencyBadge,
} from '@/components/blood/blood-status-badge'
import { BLOOD_COMPONENT_LABELS, type BloodRequestStatus } from '@/types/blood'
import type { BloodRequest } from '@/types/blood'
import { formatDateTime } from '@/lib/clinical'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

interface BloodRequestDrawerProps {
  request: BloodRequest | null
  canAct: boolean
  busy: boolean
  onStatusChange: (status: BloodRequestStatus) => void
  onOpenChange: (open: boolean) => void
}

/** Blood request detail with frontend-only status transitions. */
export function BloodRequestDrawer({
  request,
  canAct,
  busy,
  onStatusChange,
  onOpenChange,
}: BloodRequestDrawerProps) {
  if (!request) return null
  const open = request.status === 'pending' || request.status === 'processing'

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 leading-6">
            <Droplets aria-hidden="true" className="size-4 text-primary" />
            {request.requestId}
          </SheetTitle>
          <SheetDescription>
            <span className="flex flex-wrap items-center gap-1.5">
              <RequestStatusBadge status={request.status} />
              <RequestUrgencyBadge urgency={request.urgency} />
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4 pt-0">
          <dl className="divide-y divide-border rounded-xl border p-4">
            <DetailRow label="Hospital" value={request.hospital} />
            <DetailRow label="Ward / bed" value={request.ward} />
            <DetailRow label="Patient" value={`${request.patientName} · ${request.patientId}`} />
            <DetailRow label="Blood group" value={request.bloodGroup} />
            <DetailRow label="Component" value={BLOOD_COMPONENT_LABELS[request.component]} />
            <DetailRow label="Units requested" value={String(request.unitsRequested)} />
            <DetailRow label="Requested at" value={formatDateTime(request.requestedAt)} />
            <DetailRow label="Coordinator" value={request.coordinator} />
          </dl>

          {canAct && open ? (
            <>
              <Separator />
              <div className="space-y-2">
                {request.status === 'pending' ? (
                  <Button
                    className="w-full"
                    disabled={busy}
                    onClick={() => onStatusChange('processing')}
                  >
                    <Hammer aria-hidden="true" className="size-4" />
                    Start processing
                  </Button>
                ) : null}
                {request.status === 'processing' ? (
                  <Button
                    className="w-full"
                    disabled={busy}
                    onClick={() => onStatusChange('fulfilled')}
                  >
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                    Mark fulfilled
                  </Button>
                ) : null}
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onStatusChange('cancelled')}
                >
                  Cancel request
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Demo action — updates the request in local state only.
              </p>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}