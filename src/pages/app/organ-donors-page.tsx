import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCheck, HeartHandshake, UserCheck, UsersRound } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { DonorDrawer, DonorTable } from '@/components/organ'
import type { LivingDonor } from '@/types/organ'
import { organService } from '@/services'

/** Living donor registry: KPIs, search, filters, donor detail. */
export function OrganDonorsPage() {
  const [viewed, setViewed] = useState<LivingDonor | null>(null)

  const { data: donors, isLoading, isError, refetch } = useQuery({
    queryKey: ['organ', 'donors'],
    queryFn: () => organService.listDonors(),
  })

  const kpis = useMemo(() => {
    const items = donors ?? []
    return {
      total: items.length,
      available: items.filter((donor) => donor.evaluationStatus === 'available').length,
      underEvaluation: items.filter((donor) => donor.evaluationStatus === 'under_evaluation').length,
      matched: items.filter((donor) => donor.evaluationStatus === 'matched').length,
    }
  }, [donors])

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Living Donor Registry"
        description="Dedicated living donor registry with availability tracking and the full evaluation pipeline."
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
              label="Total donors"
              value={kpis.total}
              context="In the living donor registry"
              icon={UsersRound}
              tone="info"
            />
            <KpiCard
              label="Available"
              value={kpis.available}
              context="Passed current evaluation"
              icon={HeartHandshake}
              tone="success"
            />
            <KpiCard
              label="Under evaluation"
              value={kpis.underEvaluation}
              context="Workup in progress"
              icon={UserCheck}
              tone="warning"
            />
            <KpiCard
              label="Matched"
              value={kpis.matched}
              context="Committed to a recipient"
              icon={CheckCheck}
            />
          </div>

          <DonorTable donors={donors ?? []} onView={setViewed} />
        </>
      )}

      <DonorDrawer
        donor={viewed}
        onOpenChange={(open) => {
          if (!open) setViewed(null)
        }}
      />
    </Container>
  )
}