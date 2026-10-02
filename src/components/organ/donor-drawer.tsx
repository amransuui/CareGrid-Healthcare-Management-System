import { HeartHandshake } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DonorAvailabilityBadge,
  DonorEvaluationBadge,
  OrganTypeBadge,
} from '@/components/organ/organ-status-badge'
import type { LivingDonor } from '@/types/organ'
import { DONOR_AVAILABILITY_LABELS } from '@/types/organ'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

interface DonorDrawerProps {
  donor: LivingDonor | null
  onOpenChange: (open: boolean) => void
}

/** Living donor detail view. */
export function DonorDrawer({ donor, onOpenChange }: DonorDrawerProps) {
  if (!donor) return null
  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 leading-6">
            <HeartHandshake aria-hidden="true" className="size-4 text-primary" />
            {donor.fullName}
          </SheetTitle>
          <SheetDescription>
            <span className="flex flex-wrap items-center gap-1.5">
              <OrganTypeBadge organ={donor.organ} />
              <DonorEvaluationBadge status={donor.evaluationStatus} />
              <DonorAvailabilityBadge availability={donor.availability} />
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4 pt-0">
          <dl className="divide-y divide-border rounded-xl border p-4">
            <DetailRow label="Donor ID" value={donor.donorId} />
            <DetailRow label="Age" value={`${donor.age} yrs`} />
            <DetailRow label="Gender" value={donor.gender} />
            <DetailRow label="Blood group" value={donor.bloodGroup} />
            <DetailRow label="Intended organ" value={donor.organ[0].toUpperCase() + donor.organ.slice(1)} />
            <DetailRow label="Compatibility" value={donor.compatibility} />
            <DetailRow
              label="Availability"
              value={DONOR_AVAILABILITY_LABELS[donor.availability]}
            />
            <DetailRow label="Last screening" value={donor.lastScreening.slice(0, 10)} />
            <DetailRow label="Location" value={donor.location} />
            <DetailRow label="Phone" value={donor.phone} />
          </dl>
          <p className="text-xs text-muted-foreground">
            Demo record — personal details are fictional and local only.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}