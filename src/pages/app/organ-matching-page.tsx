import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Activity, CheckCircle2, Gauge, HeartPulse, TimerReset } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  EMPTY_MATCH_FILTERS,
  MatchDrawer,
  MatchFilters,
  MatchTable,
} from '@/components/organ'
import type { MatchFilterState } from '@/lib/organ-filters'
import type { OrganMatch } from '@/types/organ'
import type { MatchDecision } from '@/services'
import { useSession } from '@/hooks/use-auth'
import { isClinician } from '@/lib/roles'
import { organService } from '@/services'

const OPEN_MATCH_STATUSES = new Set(['pending_review', 'active', 'offered', 'accepted', 'transplant_scheduled'])

/** Organ matching command center with KPIs, filters and decisions. */
export function OrganMatchingPage() {
  const session = useSession()
  const clinician = isClinician(session?.user.role)
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<MatchFilterState>(EMPTY_MATCH_FILTERS)
  const [viewed, setViewed] = useState<OrganMatch | null>(null)

  const { data: matches, isLoading, isError, refetch } = useQuery({
    queryKey: ['organ', 'matches'],
    queryFn: () => organService.listMatches(),
  })

  const kpis = useMemo(() => {
    const items = matches ?? []
    const open = items.filter((entry) => OPEN_MATCH_STATUSES.has(entry.status))
    const avg = open.length
      ? Math.round(open.reduce((sum, entry) => sum + entry.compatibilityScore, 0) / open.length)
      : 0
    return {
      activeCases: items.filter((entry) => OPEN_MATCH_STATUSES.has(entry.status)).length,
      urgent: items.filter((entry) => entry.urgency === 'urgent').length,
      availableOrgans: items.filter((entry) => entry.status === 'offered').length,
      pendingDecisions: items.filter((entry) => entry.status === 'pending_review').length,
      avgScore: avg,
    }
  }, [matches])

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return (matches ?? []).filter((match) => {
      if (filters.organ !== 'all' && match.organ !== filters.organ) return false
      if (filters.bloodGroup !== 'all' && match.bloodGroup !== filters.bloodGroup) return false
      if (filters.urgency !== 'all' && match.urgency !== filters.urgency) return false
      if (filters.status !== 'all' && match.status !== filters.status) return false
      if (filters.minScore > 0 && match.compatibilityScore < filters.minScore) return false
      if (q) {
        const haystack =
          `${match.matchId} ${match.recipientName} ${match.recipientId} ${match.donorName} ${match.recipientLocation} ${match.donorLocation}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [matches, filters])

  const mutateDecide = useMutation({
    mutationFn: ({ matchId, decision }: { matchId: string; decision: MatchDecision }) =>
      organService.decideMatch(matchId, decision, session?.user.fullName ?? 'Transplant Team'),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['organ', 'matches'] })
      queryClient.invalidateQueries({ queryKey: ['organ', 'match'] })
      setViewed((current) => (current?.matchId === updated.matchId ? updated : current))
      toast.success(updated.status === 'accepted' ? 'Offer accepted' : 'Offer declined')
    },
    onError: () => toast.error('Could not record the decision.'),
  })

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Organ Matching"
        description="Transplant matching command center across participating hospitals."
      />

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <KpiCard
              label="Active matching cases"
              value={kpis.activeCases}
              context="Open and in review"
              icon={Activity}
              tone="info"
            />
            <KpiCard
              label="Urgent cases"
              value={kpis.urgent}
              context="Require immediate attention"
              icon={TimerReset}
              tone="critical"
            />
            <KpiCard
              label="Available organs"
              value={kpis.availableOrgans}
              context="Offered, awaiting decision"
              icon={HeartPulse}
              tone="success"
            />
            <KpiCard
              label="Pending decisions"
              value={kpis.pendingDecisions}
              context="Awaiting clinical review"
              icon={CheckCircle2}
              tone="warning"
            />
            <KpiCard
              label="Compatibility overview"
              value={`${kpis.avgScore}%`}
              context="Average of open matches"
              icon={Gauge}
            />
          </div>

          <MatchFilters filters={filters} onChange={setFilters} />
          <MatchTable matches={filtered} onView={setViewed} />
        </>
      )}

      <MatchDrawer
        match={viewed}
        canDecide={clinician}
        busy={mutateDecide.isPending}
        onDecide={(decision) =>
          viewed ? mutateDecide.mutate({ matchId: viewed.matchId, decision }) : undefined
        }
        onOpenChange={(open) => {
          if (!open) setViewed(null)
        }}
      />
    </Container>
  )
}