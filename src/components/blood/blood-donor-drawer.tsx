import { UsersRound } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  ContactStatusBadge,
  DonorStatusBadge,
} from '@/components/blood/blood-status-badge'
import { computeDonorEligibility } from '@/lib/blood'
import type { BloodDonor } from '@/types/blood'
import { formatDate } from '@/lib/clinical'
import { userInitials } from '@/lib/utils'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

interface BloodDonorDrawerProps {
  donor: BloodDonor | null
  onOpenChange: (open: boolean) => void
}

/** Donor detail view with 56-day interval status. */
export function BloodDonorDrawer({ donor, onOpenChange }: BloodDonorDrawerProps) {
  if (!donor) return null
  const info = computeDonorEligibility(donor)
  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 leading-6">
            <UsersRound aria-hidden="true" className="size-4 text-primary" />
            {donor.fullName}
          </SheetTitle>
          <SheetDescription>
            <span className="flex flex-wrap items-center gap-1.5">
              <DonorStatusBadge status={info.status} />
              <ContactStatusBadge status={donor.contact} />
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-3">
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              {userInitials(donor.fullName)}
            </span>
            <div>
              <p className="text-sm font-medium">
                {donor.bloodGroup} · {donor.age} yrs · {donor.gender}
              </p>
              <p className="text-xs text-muted-foreground">
                {info.status === 'eligible'
                  ? 'Eligible under the 56-day interval'
                  : info.status === 'donated_recently'
                    ? `On hold for ${info.holdingDaysLeft} more days`
                    : donor.status === 'deferred'
                      ? 'Temporarily unavailable'
                      : 'Not eligible at this time'}
              </p>
            </div>
          </div>

          <dl className="divide-y divide-border rounded-xl border p-4">
            <DetailRow label="Donor ID" value={donor.donorId} />
            <DetailRow
              label="Last donation"
              value={donor.lastDonation ? formatDate(donor.lastDonation) : 'Never'}
            />
            <DetailRow label="Total donations" value={String(donor.totalDonations)} />
            <DetailRow label="Last screening" value={formatDate(donor.lastScreening)} />
            <DetailRow label="Phone" value={donor.phone} />
            <DetailRow label="Location" value={donor.location} />
          </dl>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <p>
              <span className="font-medium">Demo eligibility logic.</span> The 56-day donation
              interval is presented as a frontend rule for demonstration; real eligibility
              decisions are made by the blood bank.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}