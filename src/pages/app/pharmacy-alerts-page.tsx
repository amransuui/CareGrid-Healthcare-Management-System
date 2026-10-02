import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Bell, CalendarCheck, Eye, Search, ShieldAlert, TriangleAlert } from 'lucide-react'
import { cn } from 'cn'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import {
  SafetyAlertSeverityBadge,
  SafetyAlertStatusBadge,
  SafetyAlertTypeBadge,
} from '@/components/pharmacy/pharmacy-status-badges'
import { AlertDrawer } from '@/components/pharmacy/alert-drawer'
import {
  SAFETY_ALERT_SEVERITIES,
  SAFETY_ALERT_SEVERITY_LABELS,
  SAFETY_ALERT_STATUSES,
  SAFETY_ALERT_STATUS_LABELS,
  SAFETY_ALERT_TYPES,
  SAFETY_ALERT_TYPE_LABELS,
  type SafetyAlert,
  type SafetyAlertStatus,
  type SafetyAlertType,
  type SafetyAlertSeverity,
} from '@/types/pharmacy'
import { pharmacyService } from '@/services'
import { timeAgo } from '@/lib/time'

const PAGE_SIZE = 8

/** Pharmacy safety alerts: allergy, interaction, duplicate, stock and expiry. */
export function PharmacyAlertsPage() {
  const queryClient = useQueryClient()
  const { data: alerts, isLoading, isError, refetch } = useQuery({
    queryKey: ['pharmacy', 'alerts'],
    queryFn: () => pharmacyService.listAlerts(),
  })

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<'newest' | 'severity'>('newest')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SafetyAlert | null>(null)

  const items = alerts ?? []

  const kpis = useMemo(() => {
    const open = items.filter(
      (alert) => alert.status === 'new' || alert.status === 'reviewing',
    )
    return {
      open: open.length,
      highOpen: open.filter((alert) => alert.severity === 'high').length,
      actionable: open.filter((alert) => alert.assignedRole === 'Pharmacist').length,
      resolved: items.filter(
        (alert) =>
          alert.status === 'resolved' &&
          Date.now() - new Date(alert.createdAt).getTime() <= 86_400_000,
      ).length,
    }
  }, [items])

  const mutation = useMutation({
    mutationFn: (input: { alertId: string; status: SafetyAlertStatus }) =>
      pharmacyService.updateAlertStatus(input.alertId, input.status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'alerts'] })
      toast.success(
        `Alert ${updated.alertId} is now ${SAFETY_ALERT_STATUS_LABELS[updated.status]}.`,
      )
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Could not update the alert.'),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = items.filter((alert) => {
      if (type !== 'all' && alert.type !== type) return false
      if (severity !== 'all' && alert.severity !== severity) return false
      if (status !== 'all' && alert.status !== status) return false
      if (q) {
        const haystack =
          `${alert.alertId} ${alert.subject} ${alert.medication ?? ''} ${alert.patientId ?? ''} ${alert.context}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    const ordered = [...list]
    if (sort === 'severity') {
      const rank: Record<SafetyAlertSeverity, number> = { high: 0, medium: 1, low: 2 }
      ordered.sort((a, b) => rank[a.severity] - rank[b.severity])
    } else {
      ordered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }
    return ordered
  }, [items, search, type, severity, status, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  const hasActive = search !== '' || type !== 'all' || severity !== 'all' || status !== 'all'

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full sm:w-2/3" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container>
        <ErrorState
          title="Could not load safety alerts"
          description="The pharmacy safety alerts could not be read. Please try again."
          onRetry={() => void refetch()}
        />
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <PageHeader
          title="Safety alerts"
          description="Allergy, interaction, duplicate, low-stock and expiry alerts raised while prescribing and dispensing."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Open alerts"
            value={kpis.open}
            context="Requiring review or resolution"
            icon={Bell}
            tone="warning"
          />
          <KpiCard
            label="High severity"
            value={kpis.highOpen}
            context="Open alerts that need immediate attention"
            icon={ShieldAlert}
            tone="critical"
          />
          <KpiCard
            label="Pharmacist queue"
            value={kpis.actionable}
            context="Open alerts assigned to the pharmacy team"
            icon={TriangleAlert}
            tone="info"
          />
          <KpiCard
            label="Resolved today"
            value={kpis.resolved}
            context="Alerts closed in the last 24 hours"
            icon={CalendarCheck}
            tone="success"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <label htmlFor="alert-search" className="sr-only">
              Search alerts by ID, subject, medicine or patient
            </label>
            <Input
              id="alert-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search alerts…"
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={type} onValueChange={(value) => { setType(value); setPage(1) }}>
              <SelectTrigger aria-label="Filter by type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(SAFETY_ALERT_TYPES as readonly SafetyAlertType[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {SAFETY_ALERT_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severity} onValueChange={(value) => { setSeverity(value); setPage(1) }}>
              <SelectTrigger aria-label="Filter by severity">
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                {(SAFETY_ALERT_SEVERITIES as readonly SafetyAlertSeverity[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {SAFETY_ALERT_SEVERITY_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
              <SelectTrigger aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(SAFETY_ALERT_STATUSES as readonly SafetyAlertStatus[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {SAFETY_ALERT_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(value) => { setSort(value as typeof sort); setPage(1) }}>
              <SelectTrigger aria-label="Sort alerts">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="severity">Highest severity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActive ? (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setType('all')
                  setSeverity('all')
                  setStatus('all')
                  setPage(1)
                }}
              >
                Clear
              </Button>
            </div>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No alerts match"
            description="Adjust the search or filters to see safety alerts."
          />
        ) : (
          <div className="grid gap-3">
            {rows.map((alert) => (
              <div
                key={alert.alertId}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{alert.subject}</p>
                    {alert.medication ? (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {alert.medication}
                      </span>
                    ) : null}
                    <SafetyAlertStatusBadge status={alert.status} />
                  </div>
                  <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                    {alert.context}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <SafetyAlertTypeBadge type={alert.type} />
                    <SafetyAlertSeverityBadge severity={alert.severity} />
                    <span>{alert.assignedRole}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={alert.createdAt}>{timeAgo(alert.createdAt)}</time>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button size="sm" variant="outline" onClick={() => setSelected(alert)}>
                    <Eye aria-hidden="true" className="size-3.5" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                aria-label="Previous page"
              >
                Previous
              </Button>
            </PaginationItem>
            {Array.from({ length: Math.min(pageCount, 7) }, (_, index) => (
              <PaginationItem key={index + 1}>
                <PaginationLink
                  isActive={index + 1 === safePage}
                  onClick={() => setPage(index + 1)}
                  className={cn(index + 1 === safePage ? 'cursor-default' : 'cursor-pointer')}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                aria-label="Next page"
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <AlertDrawer
        alert={selected}
        busy={mutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        onStatusChange={(alertItem, nextStatus) =>
          mutation.mutate({ alertId: alertItem.alertId, status: nextStatus })
        }
      />
    </Container>
  )
}