import { ListChecks } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  OrganTypeBadge,
  WaitlistPriorityBadge,
  WaitlistStatusBadge,
} from '@/components/organ/organ-status-badge'
import type { WaitingListCandidate } from '@/types/organ'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

interface WaitingDrawerProps {
  candidate: WaitingListCandidate | null
  onOpenChange: (open: boolean) => void
}

/** Waiting-list candidate detail with clinical notes. */
export function WaitingDrawer({ candidate, onOpenChange }: WaitingDrawerProps) {
  if (!candidate) return null
  const waitingDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(candidate.registeredAt).getTime()) / 86_400_000),
  )
  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 leading-6">
            <ListChecks aria-hidden="true" className="size-4 text-primary" />
            {candidate.patientName}
          </SheetTitle>
          <SheetDescription>
            <span className="flex flex-wrap items-center gap-1.5">
              <OrganTypeBadge organ={candidate.organ} />
              <WaitlistPriorityBadge priority={candidate.priority} />
              <WaitlistStatusBadge status={candidate.status} />
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4 pt-0">
          <dl className="divide-y divide-border rounded-xl border p-4">
            <DetailRow label="Patient ID" value={candidate.patientId} />
            <DetailRow label="Organ needed" value={candidate.organ[0].toUpperCase() + candidate.organ.slice(1)} />
            <DetailRow label="Blood group" value={candidate.bloodGroup} />
            <DetailRow label="Waiting time" value={`${waitingDays} days`} />
            <DetailRow label="Registered" value={candidate.registeredAt.slice(0, 10)} />
            <DetailRow label="Last review" value={candidate.lastReview.slice(0, 10)} />
          </dl>
          <div>
            <h3 className="mb-1 text-sm font-semibold">Clinical notes</h3>
            <p className="rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
              {candidate.notes ?? 'No notes recorded for this candidate.'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Demo record — waiting-list data is fictional and local only.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}