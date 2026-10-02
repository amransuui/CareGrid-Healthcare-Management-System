import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Lock, Receipt, ShieldCheck, XCircle } from 'lucide-react'
import { Container } from '@/components/common/container'
import { DemoNotice } from '@/components/common/demo-notice'
import { DetailList } from '@/components/common/detail-list'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PanelHeader } from '@/components/common/panel-header'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MoneyBreakdown } from '@/components/billing/money-breakdown'
import { CLAIM_TONES } from '@/components/billing/billing-status-badges'
import { useSession } from '@/hooks/use-auth'
import { billingService } from '@/services'
import { canManageBilling } from '@/lib/roles'
import { formatBdt, formatPercent } from '@/lib/format'
import { CLAIM_TRANSITIONS, claimSettlementPercent } from '@/lib/billing'
import {
  CLAIM_STATUS_LABELS,
  type ClaimStatus,
} from '@/types/billing'

/** Single demo claim: decision timeline, settlement split and workflow actions. */
export function BillingClaimDetailPage() {
  const { claimId = '' } = useParams()
  const session = useSession()
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: claim, isLoading, isError, refetch } = useQuery({
    queryKey: ['billing', 'claim', claimId],
    queryFn: () => billingService.getClaim(claimId),
    enabled: claimId.length > 0,
  })

  const { data: invoice } = useQuery({
    queryKey: ['billing', 'invoice', claim?.invoiceId],
    queryFn: () => billingService.getInvoice(claim?.invoiceId ?? ''),
    enabled: Boolean(claim?.invoiceId),
  })

  const actor = session?.user.fullName ?? 'Billing office'
  const mayEdit = canManageBilling(session?.user.role)

  const statusMutation = useMutation({
    mutationFn: (next: ClaimStatus) =>
      billingService.updateClaimStatus(
        claimId,
        next,
        note.trim() || `Status moved to ${CLAIM_STATUS_LABELS[next].toLowerCase()} in the demo.`,
        actor,
      ),
    onSuccess: async () => {
      setActionError(null)
      setNote('')
      await queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'That action is not available.')
    },
  })

  if (isLoading) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <PageSkeleton kpis={0} />
      </Container>
    )
  }

  if (isError || !claim) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Claim not found"
          description={`No demo claim matches ${claimId}.`}
          onRetry={() => void refetch()}
        />
        <Button asChild variant="outline">
          <Link to="/app/billing/claims">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to claims
          </Link>
        </Button>
      </Container>
    )
  }

  const nextStatuses = CLAIM_TRANSITIONS[claim.status]
  const settlement = claimSettlementPercent(claim)
  const variance = claim.amount - claim.approvedAmount

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title={claim.claimId}
        description={`${claim.patientName} · ${claim.invoiceId} · ${claim.providerName}`}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link to="/app/billing/claims">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Claims
              </Link>
            </Button>
            {invoice ? (
              <Button asChild variant="outline">
                <Link to={`/app/billing/invoices/${invoice.invoiceId}`}>
                  <Receipt aria-hidden="true" className="size-4" />
                  View invoice
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <DemoNotice
        tone="warning"
        title="Fictional claim"
        description="This claim, its insurer, policy and every decision on the timeline are invented for demonstration. No insurer is contacted, and no real coverage or liability exists."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="shadow-card">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  tone={CLAIM_TONES[claim.status]}
                  label={CLAIM_STATUS_LABELS[claim.status]}
                />
                <span className="text-xs text-muted-foreground">
                  Policy {claim.policyNumber} · updated {claim.updatedAt.slice(0, 10)}
                </span>
              </div>

              <DetailList
                items={[
                  { label: 'Patient', value: `${claim.patientName} (${claim.patientId})` },
                  { label: 'Invoice', value: claim.invoiceId },
                  { label: 'Insurer', value: claim.providerName },
                  { label: 'Submitted', value: claim.submittedAt.slice(0, 10) },
                  { label: 'Last updated', value: claim.updatedAt.slice(0, 10) },
                  { label: 'Current status', value: CLAIM_STATUS_LABELS[claim.status] },
                ]}
              />

              {claim.rejectionReason ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  <span className="font-medium">Demo rejection reason: </span>
                  {claim.rejectionReason}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 sm:p-5">
              <PanelHeader
                title="Decision timeline"
                description="Every recorded step of this fictional claim."
                className="mb-4"
              />
              <ol className="space-y-4">
                {claim.history.map((event, index) => (
                  <li key={`${event.at}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className="mt-1 size-2.5 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      {index < claim.history.length - 1 ? (
                        <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          tone={CLAIM_TONES[event.status]}
                          label={CLAIM_STATUS_LABELS[event.status]}
                        />
                        <time
                          dateTime={event.at}
                          className="text-xs text-muted-foreground tabular-nums"
                        >
                          {event.at.slice(0, 10)} {event.at.slice(11, 16)}
                        </time>
                      </div>
                      <p className="mt-1 text-sm">{event.note}</p>
                      <p className="text-xs text-muted-foreground">Recorded by {event.actor}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <MoneyBreakdown
            title="Settlement"
            rows={[
              { label: 'Claimed', value: formatBdt(claim.amount) },
              {
                label: 'Approved',
                value:
                  claim.approvedAmount > 0 ? formatBdt(claim.approvedAmount) : 'Not approved yet',
                emphasis: true,
              },
              {
                label: 'Variance',
                value: claim.approvedAmount > 0 ? formatBdt(variance) : '—',
                tone: 'muted',
              },
              { label: 'Settlement share', value: formatPercent(settlement) },
            ]}
            caption="Fictional insurer arithmetic. No payment is received and no insurer account is affected."
          />

          <Card className="shadow-card">
            <CardContent className="space-y-3 p-4">
              <PanelHeader
                title="Workflow"
                description={
                  mayEdit
                    ? 'Record the next fictional decision on this claim.'
                    : 'Only the billing office can change claim status in this prototype.'
                }
              />

              {actionError ? (
                <p role="alert" className="text-sm text-destructive">
                  {actionError}
                </p>
              ) : null}

              {nextStatuses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This claim is {CLAIM_STATUS_LABELS[claim.status].toLowerCase()} and has no further
                  transitions.
                </p>
              ) : !mayEdit ? (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  You are signed in as a non-billing role, so decision actions are hidden.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="claim-note" className="text-sm font-medium">
                      Decision note
                    </label>
                    <textarea
                      id="claim-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      placeholder="Fictional note recorded against this demo claim"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses.map((next) => (
                      <Button
                        key={next}
                        variant={next === 'rejected' ? 'outline' : 'default'}
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate(next)}
                      >
                        {next === 'rejected' ? (
                          <XCircle aria-hidden="true" className="size-4" />
                        ) : (
                          <ShieldCheck aria-hidden="true" className="size-4" />
                        )}
                        {CLAIM_STATUS_LABELS[next]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Recording a decision only changes the in-memory demo ledger. It resets when the page
                reloads and has no effect on any real claim.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  )
}
