import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, CircleAlert, ShieldCheck, TimerReset } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { IschemiaBoard } from '@/components/organ'
import { organService } from '@/services'

/**
 * Simulated organ ischemia monitoring. Countdown thresholds are fictional
 * demo values for interface demonstration only, never clinical guidance.
 */
export function OrganIschemiaPage() {
  const { data: cases, isLoading, isError, refetch } = useQuery({
    queryKey: ['organ', 'ischemia'],
    queryFn: () => organService.listIschemiaCases(),
  })

  const kpis = useMemo(() => {
    const items = cases ?? []
    return {
      active: items.filter((case_) => case_.status === 'stable' || case_.status === 'active' || case_.status === 'critical').length,
      critical: items.filter((case_) => case_.status === 'critical').length,
      stable: items.filter((case_) => case_.status === 'stable').length,
      completed: items.filter((case_) => case_.status === 'completed').length,
    }
  }, [cases])

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Ischemia Monitoring"
        description="Time-critical organ transport tracking — simulated demo timers."
      />

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          <span className="font-medium">Simulated monitoring.</span>{' '}
          Countdown limits and statuses are fictional demo values used to render
          the interface. They are not established cold/warm ischemia thresholds
          and must not be used for clinical decisions.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              label="Active organ cases"
              value={kpis.active}
              context="Running transplant transports"
              icon={TimerReset}
              tone="info"
            />
            <KpiCard
              label="Critical timers"
              value={kpis.critical}
              context="Near or past demo limit"
              icon={CircleAlert}
              tone="critical"
            />
            <KpiCard
              label="Stable cases"
              value={kpis.stable}
              context="Well within demo limit"
              icon={ShieldCheck}
              tone="success"
            />
            <KpiCard
              label="Completed cases"
              value={kpis.completed}
              context="Transplant concluded"
              icon={CheckCircle2}
            />
          </div>

          <IschemiaBoard cases={cases ?? []} />
        </>
      )}
    </Container>
  )
}