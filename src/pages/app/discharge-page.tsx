import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleSlash, ClipboardList, FileCheck2, LogOut, Wallet } from 'lucide-react'
import { Container } from '@/components/common/container'
import { DataToolbar } from '@/components/common/data-toolbar'
import { DemoNotice } from '@/components/common/demo-notice'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { SortableHead } from '@/components/common/sortable-head'
import { TablePager } from '@/components/common/table-pager'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DischargeBillingBadge,
  DischargeStatusBadge,
  DocumentationStatusBadge,
} from '@/components/billing/billing-status-badges'
import { useListControls } from '@/hooks/use-list-controls'
import { dischargeService } from '@/services'
import { formatBdtCompact } from '@/lib/format'
import { checklistProgress, dischargeBlockers } from '@/lib/discharge'
import { matchesQuery } from '@/lib/table'
import {
  DISCHARGE_STATUSES,
  DISCHARGE_STATUS_LABELS,
  type DischargeCase,
  type DischargeStatus,
} from '@/types/discharge'

const PAGE_SIZE = 8

/** Discharge coordination board: readiness, documentation and billing position. */
export function DischargePage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [documentation, setDocumentation] = useState<string>('all')

  const summaryQuery = useQuery({
    queryKey: ['discharge', 'summary'],
    queryFn: () => dischargeService.getSummary(),
  })
  const casesQuery = useQuery({
    queryKey: ['discharge', 'cases'],
    queryFn: () => dischargeService.listCases(),
  })

  const all = useMemo(() => casesQuery.data ?? [], [casesQuery.data])

  const filtered = useMemo(
    () =>
      all.filter((entry) => {
        if (status !== 'all' && entry.dischargeStatus !== status) return false
        if (documentation !== 'all' && entry.documentationStatus !== documentation) return false
        if (search.trim()) {
          return matchesQuery(
            `${entry.patientName} ${entry.patientId} ${entry.admissionId} ${entry.ward} ${entry.bed} ${entry.attendingDoctor} ${entry.primaryDiagnosis}`,
            search,
          )
        }
        return true
      }),
    [all, status, documentation, search],
  )

  const { rows, total, sort, onSort, page, pageCount, setPage } = useListControls<
    DischargeCase,
    'patient' | 'planned' | 'checklist' | 'balance'
  >({
    rows: filtered,
    accessors: {
      patient: (entry) => entry.patientName,
      planned: (entry) => entry.plannedDischargeAt,
      checklist: (entry) => checklistProgress(entry.checklist).percent,
      balance: (entry) => entry.billing.outstandingAmount,
    },
    initialSort: { key: 'planned', direction: 'asc' },
    pageSize: PAGE_SIZE,
  })

  const hasFilters = search !== '' || status !== 'all' || documentation !== 'all'

  if (summaryQuery.isLoading || casesQuery.isLoading) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <PageSkeleton kpis={4} />
      </Container>
    )
  }

  if (summaryQuery.isError || casesQuery.isError) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Could not load discharge records"
          description="The demo discharge list could not be read. Please try again."
          onRetry={() => {
            void summaryQuery.refetch()
            void casesQuery.refetch()
          }}
        />
      </Container>
    )
  }

  const summary = summaryQuery.data

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Digital discharge"
        description="Readiness, documentation and billing coordination for every planned discharge."
      />

      <DemoNotice
        tone="warning"
        title="Coordination aid only"
        description="Patients, notes and vitals in this module are fictional. Releasing a record here does not authorise anyone to leave the facility, and no summary produced here is a signed clinical or legal document."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ready for discharge"
          value={summary?.ready ?? 0}
          context="Documentation, checklist and billing all clear"
          icon={FileCheck2}
          tone="success"
        />
        <KpiCard
          label="In progress"
          value={summary?.pending ?? 0}
          context="Admissions still being prepared"
          icon={ClipboardList}
          tone="info"
        />
        <KpiCard
          label="On hold"
          value={summary?.onHold ?? 0}
          context="Blocked by an outstanding coordination item"
          icon={CircleSlash}
          tone="critical"
        />
        <KpiCard
          label="Outstanding balances"
          value={formatBdtCompact(summary?.requiredOutstanding ?? 0)}
          context={`${summary?.documentationPending ?? 0} record(s) with documentation pending · ${summary?.dischargedToday ?? 0} discharged today`}
          icon={Wallet}
          tone="warning"
        />
      </div>

      <DataToolbar
        searchId="discharge-search"
        searchLabel="Search discharge records by patient, admission, ward or doctor"
        searchPlaceholder="Search discharge records…"
        value={search}
        onValueChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        canReset={hasFilters}
        onReset={() => {
          setSearch('')
          setStatus('all')
          setDocumentation('all')
          setPage(1)
        }}
      >
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by discharge status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {DISCHARGE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {DISCHARGE_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={documentation}
          onValueChange={(value) => {
            setDocumentation(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by documentation status">
            <SelectValue placeholder="All documentation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All documentation</SelectItem>
            <SelectItem value="complete">Documentation complete</SelectItem>
            <SelectItem value="in_progress">Documentation in progress</SelectItem>
            <SelectItem value="not_started">Documentation not started</SelectItem>
          </SelectContent>
        </Select>
      </DataToolbar>

      {rows.length === 0 ? (
        <EmptyState
          title="No discharge records match"
          description={
            hasFilters
              ? 'Adjust the search or filters to see more records.'
              : 'No admissions are being prepared for discharge.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead columnKey="patient" sort={sort} onSort={onSort}>
                    Patient
                  </SortableHead>
                  <TableHead>Admission</TableHead>
                  <SortableHead columnKey="planned" sort={sort} onSort={onSort}>
                    Planned
                  </SortableHead>
                  <SortableHead columnKey="checklist" sort={sort} onSort={onSort}>
                    Checklist
                  </SortableHead>
                  <TableHead>Documentation</TableHead>
                  <TableHead>Billing</TableHead>
                  <SortableHead columnKey="balance" sort={sort} onSort={onSort} numeric>
                    Outstanding
                  </SortableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((entry) => {
                  const progress = checklistProgress(entry.checklist)
                  const blockers = dischargeBlockers(entry)
                  return (
                    <TableRow key={entry.patientId}>
                      <TableCell>
                        <p className="text-sm font-medium">{entry.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.patientId} · {entry.age} yrs · {entry.gender}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{entry.admissionId}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.ward} · {entry.bed}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground tabular-nums">
                        {entry.plannedDischargeAt.slice(0, 10)}
                        <span className="block text-xs">
                          {entry.plannedDischargeAt.slice(11, 16)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex w-32 flex-col gap-1.5">
                          <Progress
                            value={progress.percent}
                            aria-label={`Checklist ${progress.percent} percent complete`}
                          />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {progress.completed}/{progress.total} items
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DocumentationStatusBadge status={entry.documentationStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <DischargeBillingBadge status={entry.billing.status} />
                          {blockers.length > 0 && entry.dischargeStatus !== 'discharged' ? (
                            <span className="text-xs text-muted-foreground">
                              {blockers.length} blocker{blockers.length === 1 ? '' : 's'}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums">
                        {entry.billing.outstandingAmount > 0
                          ? formatBdtCompact(entry.billing.outstandingAmount)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <DischargeStatusBadge status={entry.dischargeStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            to={`/app/discharge/${entry.patientId}`}
                            aria-label={`Open discharge record for ${entry.patientName}`}
                          >
                            {entry.dischargeStatus === 'discharged' ? (
                              <>
                                <LogOut aria-hidden="true" className="size-3.5" />
                                Summary
                              </>
                            ) : (
                              'Prepare'
                            )}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <TablePager
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        total={total}
        unitLabel="records"
        pageSize={PAGE_SIZE}
      />

      <p className="text-xs text-muted-foreground">
        Status filter: {status === 'all' ? 'all statuses' : DISCHARGE_STATUS_LABELS[status as DischargeStatus]}.
        Records marked on hold still require the coordination items listed on the detail page.
      </p>
    </Container>
  )
}
