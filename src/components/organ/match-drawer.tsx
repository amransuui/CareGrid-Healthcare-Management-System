import { Check, HeartPulse, X } from 'lucide-react'
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
  MatchStatusBadge,
  OrganTypeBadge,
  UrgencyBadge,
} from '@/components/organ/organ-status-badge'
import type { MatchStatus, OrganMatch } from '@/types/organ'
import { MATCH_STATUS_LABELS, URGENCY_LABELS } from '@/types/organ'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

const DECIDABLE_STATUSES: MatchStatus[] = ['pending_review', 'active', 'offered']

interface MatchDrawerProps {
  match: OrganMatch | null
  canDecide: boolean
  busy: boolean
  onDecide: (decision: 'accept' | 'decline') => void
  onOpenChange: (open: boolean) => void
}

/** Detailed match view with compatibility factors and decision actions. */
export function MatchDrawer({
  match,
  canDecide,
  busy,
  onDecide,
  onOpenChange,
}: MatchDrawerProps) {
  const decisionOpen = Boolean(match) && canDecide && (match ? DECIDABLE_STATUSES.includes(match.status) : false)

  return (
    <Sheet open={Boolean(match)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {match ? (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 leading-6">
                <HeartPulse aria-hidden="true" className="size-4 text-primary" />
                {match.matchId}
              </SheetTitle>
              <SheetDescription>
                <span className="flex flex-wrap items-center gap-1.5">
                  <OrganTypeBadge organ={match.organ} />
                  <MatchStatusBadge status={match.status} />
                  <UrgencyBadge urgency={match.urgency} />
                </span>
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-4 pt-0">
              <div className="flex flex-col items-center gap-1 rounded-xl border bg-muted/30 p-4 text-center">
                <span className="text-3xl font-semibold tabular-nums">
                  {match.compatibilityScore}%
                </span>
                <span className="text-sm text-muted-foreground">
                  Compatibility score · {URGENCY_LABELS[match.urgency]} ·{' '}
                  {match.waitingTimeDays}d waiting
                </span>
              </div>

              <section aria-label="Recipient information">
                <h3 className="mb-1 text-sm font-semibold">Recipient</h3>
                <div className="rounded-xl border p-4">
                  <dl className="divide-y divide-border">
                    <DetailRow label="Name" value={match.recipientName} />
                    <DetailRow label="Patient ID" value={match.recipientId} />
                    <DetailRow label="Blood group" value={match.bloodGroup} />
                    <DetailRow label="Location" value={match.recipientLocation} />
                  </dl>
                </div>
              </section>

              <section aria-label="Donor and organ information">
                <h3 className="mb-1 text-sm font-semibold">Donor / organ</h3>
                <div className="rounded-xl border p-4">
                  <dl className="divide-y divide-border">
                    <DetailRow label="Donor" value={match.donorName} />
                    <DetailRow label="Donor ID" value={match.donorId} />
                    <DetailRow label="Origin" value={match.donorLocation} />
                    <DetailRow label="Organ" value={match.organ[0].toUpperCase() + match.organ.slice(1)} />
                    <DetailRow label="Waiting time" value={`${match.waitingTimeDays} days`} />
                  </dl>
                </div>
              </section>

              <section aria-label="Compatibility factors">
                <h3 className="mb-1 text-sm font-semibold">Compatibility factors</h3>
                <div className="overflow-hidden rounded-xl border">
                  <ul className="divide-y divide-border">
                    {match.factors.map((factor) => (
                      <li key={factor.factor} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{factor.factor}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {factor.donorValue} → {factor.recipientValue}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${
                            factor.compatible ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {factor.compatible ? (
                            <Check aria-hidden="true" className="size-3.5" />
                          ) : (
                            <X aria-hidden="true" className="size-3.5" />
                          )}
                          {factor.compatible ? 'Compatible' : 'Caveat'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section aria-label="Clinical notes">
                <h3 className="mb-1 text-sm font-semibold">Clinical notes</h3>
                <p className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
                  {match.clinicalNotes}
                </p>
              </section>

              <div className="text-xs text-muted-foreground">
                Status: {MATCH_STATUS_LABELS[match.status]} · Last updated{' '}
                {new Date(match.lastUpdated).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              {decisionOpen ? (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="flex-1"
                      disabled={busy}
                      onClick={() => onDecide('accept')}
                    >
                      <Check aria-hidden="true" className="size-4" />
                      Accept offer
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      disabled={busy}
                      onClick={() => onDecide('decline')}
                    >
                      <X aria-hidden="true" className="size-4" />
                      Decline offer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Demo action — records the decision in local state only; no
                    real transplant order is created.
                  </p>
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}