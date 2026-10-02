import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarClock, ListChecks, Timer, UserPlus } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { WaitingDrawer, WaitingTable } from '@/components/organ'
import type { WaitingListCandidate } from '@/types/organ'
import { organService } from '@/services'

const DAY_MS = 86_400_000

function waitingDays(candidate: WaitingListCandidate): number {
  return Math.max(0, Math.floor((Date.now() - new Date(candidate.registeredAt).getTime()) / DAY_MS))
}

/** National waiting list: KPIs, search, filters, sorting. */
export function OrganWaitingListPage() {
  const [viewed, setViewed] = useState<WaitingListCandidate | null>(null)

  const { data: candidates, isLoading, isError, refetch } = useQuery({
    queryKey: ['organ', 'waiting-list'],
    queryFn: () => organService.listWaitlist(),
  })

  const kpis = useMemo(() => {
    const items = candidates ?? []
    return {
      total: items.length,
      highPriority: items.filter(
        (candidate) => candidate.priority === 'urgent' || candidate.priority === 'high',
      ).length,
      longestWait: items.reduce((max, candidate) => Math.max(max, waitingDays(candidate)), 0),
      recentlyAdded: items.filter((candidate) => waitingDays(candidate) <= 30).length,
    }
  }, [candidates])

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Organ Waiting List"
        description="National transplant waiting list and priority queue."
      />

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              label="Total candidates"
              value={kpis.total}
              context="On the active registry"
              icon={ListChecks}
              tone="info"
            />
            <KpiCard
              label="High-priority candidates"
              value={kpis.highPriority}
              context="Urgent or high priority"
              icon={Timer}
              tone="critical"
            />
            <KpiCard
              label="Longest waiting time"
              value={`${kpis.longestWait}d`}
              context="Days since registration"
              icon={CalendarClock}
              tone="warning"
            />
            <KpiCard
              label="Recently added"
              value={kpis.recentlyAdded}
              context="Registered in the last 30 days"
              icon={UserPlus}
              tone="success"
            />
          </div>

          <WaitingTable
            candidates={candidates ?? []}
            onView={setViewed}
          />
        </>
      )}

      <WaitingDrawer
        candidate={viewed}
        onOpenChange={(open) => {
          if (!open) setViewed(null)
        }}
      />
    </Container>
  )
}