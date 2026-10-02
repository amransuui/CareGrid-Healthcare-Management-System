import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Lock,
  LogOut,
  Pill,
  Printer,
  Receipt,
  RotateCcw,
  Stethoscope,
  TriangleAlert,
} from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MoneyBreakdown } from '@/components/billing/money-breakdown'
import {
  DischargeBillingBadge,
  DischargeStatusBadge,
  DocumentationStatusBadge,
} from '@/components/billing/billing-status-badges'
import { useSession } from '@/hooks/use-auth'
import { dischargeService } from '@/services'
import { canCloseChecklistItem, canCompleteDischarge, canCoordinateDischarge } from '@/lib/roles'
import { formatBdt } from '@/lib/format'
import {
  checklistProgress,
  dischargeBillingTotals,
  dischargeBlockers,
  openRequiredItems,
} from '@/lib/discharge'

/** Single discharge record: checklist, summary draft, documents and billing. */
export function DischargeDetailPage() {
  const { patientId = '' } = useParams()
  const session = useSession()
  const queryClient = useQueryClient()
  const role = session?.user.role
  const actor = session?.user.fullName ?? 'Care team'
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: entry, isLoading, isError, refetch } = useQuery({
    queryKey: ['discharge', 'case', patientId],
    queryFn: () => dischargeService.getCase(patientId),
    enabled: patientId.length > 0,
  })

  const checklistMutation = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      dischargeService.setChecklistItem(patientId, itemId, completed, actor),
    onSuccess: async () => {
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: ['discharge'] })
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'That item could not be updated.')
    },
  })

  const documentationMutation = useMutation({
    mutationFn: (status: 'not_started' | 'in_progress' | 'complete') =>
      dischargeService.setDocumentationStatus(patientId, status),
    onSuccess: async () => {
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: ['discharge'] })
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'That change was not applied.')
    },
  })

  const dischargeMutation = useMutation({
    mutationFn: (action: 'discharge' | 'reopen') =>
      action === 'discharge'
        ? dischargeService.markDischarged(patientId, actor)
        : dischargeService.revertToPending(patientId, actor),
    onSuccess: async () => {
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: ['discharge'] })
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

  if (isError || !entry) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Discharge record not found"
          description={`No demo discharge record matches ${patientId}.`}
          onRetry={() => void refetch()}
        />
        <Button asChild variant="outline">
          <Link to="/app/discharge">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to discharge board
          </Link>
        </Button>
      </Container>
    )
  }

  const progress = checklistProgress(entry.checklist)
  const openRequired = openRequiredItems(entry.checklist)
  const blockers = dischargeBlockers(entry)
  const totals = dischargeBillingTotals(entry.billing)
  const released = entry.dischargeStatus === 'discharged'
  const mayCoordinate = canCoordinateDischarge(role)
  const mayRelease = canCompleteDischarge(role)

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title={entry.patientName}
        description={`${entry.patientId} · ${entry.admissionId} · ${entry.ward} ${entry.bed} · ${entry.primaryDiagnosis}`}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link to="/app/discharge">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Discharge board
              </Link>
            </Button>
            <Button variant="outline" disabled title="Printing is not connected in this demo">
              <Printer aria-hidden="true" className="size-4" />
              Print summary
            </Button>
          </>
        }
      />

      <DemoNotice
        tone="warning"
        title="Fictional coordination record"
        description="This patient, the notes, vitals and medication list are invented for demonstration. The summary below is an unsigned draft — it is not a clinical document, and releasing the record does not authorise anyone to leave the facility."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <DischargeStatusBadge status={entry.dischargeStatus} />
              <DocumentationStatusBadge status={entry.documentationStatus} />
              <DischargeBillingBadge status={entry.billing.status} />
              {entry.dischargedAt ? (
                <span className="text-xs text-muted-foreground">
                  Released {entry.dischargedAt.slice(0, 10)} {entry.dischargedAt.slice(11, 16)}
                </span>
              ) : null}
            </div>

            {blockers.length > 0 && !released ? (
              <div
                role="status"
                className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
              >
                <p className="flex items-center gap-2 font-medium">
                  <TriangleAlert aria-hidden="true" className="size-4" />
                  {blockers.length} item{blockers.length === 1 ? '' : 's'} to resolve before release
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {blockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : released ? (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                Released in the demo ledger. Reopening returns the record to pending.
              </p>
            ) : null}

            {actionError ? (
              <p role="alert" className="text-sm text-destructive">
                {actionError}
              </p>
            ) : null}

            <Tabs defaultValue="checklist">
              <TabsList>
                <TabsTrigger value="checklist">
                  <ClipboardList aria-hidden="true" className="size-4" />
                  Checklist
                </TabsTrigger>
                <TabsTrigger value="summary">
                  <FileText aria-hidden="true" className="size-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <Pill aria-hidden="true" className="size-4" />
                  Medicines & follow-up
                </TabsTrigger>
                <TabsTrigger value="billing">
                  <Receipt aria-hidden="true" className="size-4" />
                  Billing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="checklist" className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-40 flex-1">
                    <Progress
                      value={progress.percent}
                      aria-label={`Checklist ${progress.percent} percent complete`}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {progress.completed} of {progress.total} complete · {progress.requiredCompleted}/
                    {progress.requiredTotal} required
                  </span>
                </div>

                <ul className="divide-y rounded-lg border">
                  {entry.checklist.map((item) => {
                    const owned = canCloseChecklistItem(role, item.ownerRole)
                    const locked = !released && mayCoordinate && !owned
                    return (
                      <li key={item.id} className="flex items-start gap-3 p-3">
                        <Checkbox
                          id={item.id}
                          checked={item.completed}
                          disabled={released || !mayCoordinate || locked}
                          onCheckedChange={(checked) =>
                            checklistMutation.mutate({
                              itemId: item.id,
                              completed: checked === true,
                            })
                          }
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={item.id}
                            className="flex flex-wrap items-center gap-2 text-sm font-medium"
                          >
                            {item.label}
                            <StatusBadge
                              tone={item.required ? 'info' : 'neutral'}
                              label={item.required ? 'Required' : 'Optional'}
                              withDot={false}
                            />
                            {item.ownerRole ? (
                              <span className="text-xs font-normal text-muted-foreground">
                                {item.ownerRole}
                              </span>
                            ) : null}
                          </label>
                          {item.completed && item.completedBy ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Closed by {item.completedBy} · {item.completedAt?.slice(0, 10)}{' '}
                              {item.completedAt?.slice(11, 16)}
                            </p>
                          ) : null}
                          {locked && !released ? (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Lock aria-hidden="true" className="size-3" />
                              Owned by the {item.ownerRole} team in this demo
                            </p>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Documentation status:</span>
                  {(['not_started', 'in_progress', 'complete'] as const).map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={entry.documentationStatus === value ? 'default' : 'outline'}
                      disabled={released || !mayCoordinate || documentationMutation.isPending}
                      onClick={() => documentationMutation.mutate(value)}
                    >
                      {value === 'not_started'
                        ? 'Not started'
                        : value === 'in_progress'
                          ? 'In progress'
                          : 'Complete'}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="summary" className="mt-4 space-y-4">
                <PanelHeader
                  title="Draft discharge summary"
                  description={`Prepared by ${entry.summaryPreparedBy}. Unsigned demo text.`}
                />
                <div className="space-y-4 rounded-lg border p-4">
                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold">Presentations</h4>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {entry.diagnoses.map((diagnosis) => (
                        <li key={diagnosis}>{diagnosis}</li>
                      ))}
                    </ul>
                  </section>

                  {entry.procedures.length > 0 ? (
                    <section className="space-y-1">
                      <h4 className="text-sm font-semibold">Procedures</h4>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {entry.procedures.map((procedure) => (
                          <li key={procedure.name}>
                            {procedure.name} — {procedure.performedAt.slice(0, 10)} by{' '}
                            {procedure.performedBy}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold">Ward course</h4>
                    <p className="text-sm text-muted-foreground">{entry.dischargeNotes}</p>
                  </section>

                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold">Vitals at discharge</h4>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      BP {entry.vitalsAtDischarge.systolic}/{entry.vitalsAtDischarge.diastolic} · HR{' '}
                      {entry.vitalsAtDischarge.heartRate} · SpO₂ {entry.vitalsAtDischarge.spo2}% ·
                      Temp {entry.vitalsAtDischarge.temperature}°C · RR{' '}
                      {entry.vitalsAtDischarge.respiratoryRate}
                    </p>
                  </section>

                  {entry.pendingItems.length > 0 ? (
                    <section className="space-y-1">
                      <h4 className="text-sm font-semibold">Outstanding coordination items</h4>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {entry.pendingItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    Demonstration text only. Not a clinical document, not signed, and not valid for
                    any real care or legal purpose.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-4 space-y-4">
                <PanelHeader
                  title="Discharge medicines"
                  description="Fictional medication list carried into the demo summary."
                />
                {entry.medications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No medicines recorded.</p>
                ) : (
                  <ul className="divide-y rounded-lg border">
                    {entry.medications.map((medication) => (
                      <li key={medication.medication} className="p-3">
                        <p className="text-sm font-medium">
                          {medication.medication} {medication.strength}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {medication.dosage} · {medication.frequency} · {medication.duration} ·{' '}
                          {medication.route}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {medication.instructions} · Quantity {medication.quantity}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <PanelHeader
                  title="Follow-up plan"
                  description="Fictional appointments booked at discharge."
                />
                {entry.followUps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No follow-up recorded.</p>
                ) : (
                  <ul className="divide-y rounded-lg border">
                    {entry.followUps.map((followUp) => (
                      <li key={followUp.id} className="flex flex-wrap items-start gap-3 p-3">
                        <CalendarClock
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{followUp.department}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {followUp.scheduledAt.slice(0, 10)} {followUp.scheduledAt.slice(11, 16)}
                          </p>
                          <p className="text-sm text-muted-foreground">{followUp.instruction}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="billing" className="mt-4 space-y-4">
                <MoneyBreakdown
                  title="Admission balance"
                  rows={[
                    { label: 'Gross', value: formatBdt(totals.grossAmount) },
                    {
                      label: 'Insurance covered',
                      value: `− ${formatBdt(totals.insuranceCoveredAmount)}`,
                    },
                    { label: 'Received', value: formatBdt(totals.paidAmount) },
                    ...(totals.waivedAmount > 0
                      ? [{ label: 'Waived', value: `− ${formatBdt(totals.waivedAmount)}` }]
                      : []),
                    { label: 'Outstanding', value: formatBdt(totals.outstandingAmount), emphasis: true },
                  ]}
                  caption={`Mirrored from demo invoice ${entry.billing.invoiceId}. No payment is collected here.`}
                />
                {entry.billing.outstandingAmount > 0 ? (
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Receipt aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    Settle the balance in the billing module before this admission can be released.
                  </p>
                ) : null}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="space-y-3 p-4">
              <PanelHeader
                title="Release for discharge"
                description={
                  mayRelease
                    ? 'Demo coordination action.'
                    : 'Only a doctor or nurse can release a record in this prototype.'
                }
              />
              {released ? (
                <Button
                  variant="outline"
                  disabled={!mayRelease || dischargeMutation.isPending}
                  onClick={() => dischargeMutation.mutate('reopen')}
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Reopen as pending
                </Button>
              ) : !mayRelease ? (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  You are signed in as a role that cannot release admissions in this demo.
                </p>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    disabled={blockers.length > 0 || dischargeMutation.isPending}
                    onClick={() => dischargeMutation.mutate('discharge')}
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Mark discharged
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {blockers.length > 0
                      ? `${blockers.length} blocker${blockers.length === 1 ? '' : 's'} outstanding — the action stays disabled.`
                      : 'All coordination checks pass in the demo dataset.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <PanelHeader title="Admission" className="mb-3" />
              <DetailList
                columns={1}
                items={[
                  { label: 'Admission', value: `${entry.admissionId} (${entry.admissionType})` },
                  { label: 'Ward / bed', value: `${entry.ward} · ${entry.bed}` },
                  { label: 'Attending', value: entry.attendingDoctor },
                  { label: 'Admitted', value: entry.admittedAt.slice(0, 10) },
                  {
                    label: 'Planned discharge',
                    value: `${entry.plannedDischargeAt.slice(0, 10)} ${entry.plannedDischargeAt.slice(11, 16)}`,
                  },
                  { label: 'Summary prepared by', value: entry.summaryPreparedBy },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <PanelHeader title="Vitals at discharge" className="mb-3" />
              <div className="flex items-start gap-2">
                <HeartPulse aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm tabular-nums">
                  BP {entry.vitalsAtDischarge.systolic}/{entry.vitalsAtDischarge.diastolic} mmHg · HR{' '}
                  {entry.vitalsAtDischarge.heartRate} bpm · SpO₂ {entry.vitalsAtDischarge.spo2}% ·
                  Temp {entry.vitalsAtDischarge.temperature}°C · RR{' '}
                  {entry.vitalsAtDischarge.respiratoryRate}/min
                </p>
              </div>
              <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                <Stethoscope aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                Recorded {entry.vitalsAtDischarge.recordedAt.slice(11, 16)} · fictional demo values
                that carry no clinical meaning.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <PanelHeader title="Coordination" className="mb-3" />
              {openRequired.length > 0 ? (
                <p className="text-sm">
                  <span className="font-medium">{openRequired.length}</span> required checklist item
                  {openRequired.length === 1 ? '' : 's'} still open.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">All required items are closed.</p>
              )}
              {entry.pendingItems.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {entry.pendingItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No outstanding coordination items.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  )
}
