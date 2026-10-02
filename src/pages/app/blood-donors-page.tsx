import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, Clock3, UserCheck, UsersRound } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BloodDonorDrawer,
  BloodDonorTable,
} from '@/components/blood'
import { computeDonorEligibility } from '@/lib/blood'
import type { BloodDonor } from '@/types/blood'
import { bloodService } from '@/services'

/** Blood donor registry with the 56-day demo eligibility rule. */
export function BloodDonorsPage() {
  const [viewed, setViewed] = useState<BloodDonor | null>(null)

  const { data: donors, isLoading, isError, refetch } = useQuery({
    queryKey: ['blood', 'donors'],
    queryFn: () => bloodService.listDonors(),
  })

  const kpis = useMemo(() => {
    const items = donors ?? []
    return {
      total: items.length,
      eligible: items.filter((donor) => computeDonorEligibility(donor).status === 'eligible').length,
      recentlyDonated: items.filter(
        (donor) => computeDonorEligibility(donor).status === 'donated_recently',
      ).length,
      unavailable: items.filter((donor) => donor.status === 'deferred' || donor.status === 'ineligible').length,
    }
  }, [donors])

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Blood Donors"
        description="Donor registry with the 56-day interval applied as demo logic."
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
              context="In the donor registry"
              icon={UsersRound}
              tone="info"
            />
            <KpiCard
              label="Eligible donors"
              value={kpis.eligible}
              context="Ready to donate today"
              icon={UserCheck}
              tone="success"
            />
            <KpiCard
              label="Recently donated"
              value={kpis.recentlyDonated}
              context="Within the 56-day window"
              icon={CalendarCheck}
              tone="warning"
            />
            <KpiCard
              label="Temporarily unavailable"
              value={kpis.unavailable}
              context="Deferred or not eligible"
              icon={Clock3}
            />
          </div>

          <BloodDonorTable donors={donors ?? []} onView={setViewed} />
        </>
      )}

      <BloodDonorDrawer
        donor={viewed}
        onOpenChange={(open) => {
          if (!open) setViewed(null)
        }}
      />
    </Container>
  )
}