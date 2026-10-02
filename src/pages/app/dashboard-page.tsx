import { useMemo } from 'react'
import { ClipboardPlus, Siren, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ActivityTimeline,
  AlertPanel,
  BloodInventoryPanel,
  ChartCard,
  OrganMatchingPanel,
  PatientFlowChart,
  PrescriptionQueuePanel,
  QuickActions,
  StatCard,
  WardOccupancyChart,
} from '@/components/dashboard'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { roleDashboardFocus } from '@/data/mock/dashboard'
import { useSession } from '@/hooks/use-auth'
import { greetingForHour } from '@/lib/greeting'
import { dashboardService } from '@/services'

function KpiGridFallback() {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[7.5rem] rounded-xl" />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Fictional demo data for lab preview.
      </p>
    </>
  )
}

function OverviewFallback() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * Healthcare operations dashboard. Fenced behind the dashboard service and
 * React Query. Role emphasis is rendering-only demo behavior.
 */
export function DashboardPage() {
  const session = useSession()
  const user = session?.user
  const focus = user ? roleDashboardFocus[user.role] : undefined

  const { data: overview, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardService.getOverview(),
  })
  const { data: activity } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardService.getRecentActivity(),
  })

  const orderedKpis = useMemo(() => {
    if (!overview || !focus) return overview?.kpis ?? []
    const byId = new Map(overview.kpis.map((kpi) => [kpi.id, kpi]))
    const focused = focus.kpiIds
      .map((id) => byId.get(id))
      .filter((kpi): kpi is NonNullable<typeof kpi> => Boolean(kpi))
    const rest = overview.kpis.filter(
      (kpi) => !focus.kpiIds.includes(kpi.id),
    )
    return [...focused, ...rest]
  }, [overview, focus])

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title={
          user
            ? `${greetingForHour()}, ${user.fullName}`
            : `${greetingForHour()}`
        }
        description={focus?.greeting}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/patients">
                <Users aria-hidden="true" />
                View Patients
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/blood/sos">
                <Siren aria-hidden="true" />
                Emergency SOS
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/pharmacy/prescriptions">
                <ClipboardPlus aria-hidden="true" />
                Create Prescription
              </Link>
            </Button>
          </>
        }
      />

      <section aria-label="Key operational indicators">
        {isLoading || !overview ? (
          <KpiGridFallback />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {orderedKpis.map((kpi) => (
                <StatCard
                  key={kpi.id}
                  kpi={kpi}
                  emphasized={Boolean(focus?.kpiIds.includes(kpi.id))}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Indicators are fictional demo data for lab preview.
            </p>
          </>
        )}
      </section>

      {isLoading ? (
        <OverviewFallback />
      ) : isError || !overview ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard
              title="Patient flow"
              description="Admissions and discharges · last 7 days"
              className="xl:col-span-2"
            >
              <PatientFlowChart data={overview.patientFlow} />
            </ChartCard>
            <ChartCard
              title="Critical alerts"
              description="Needs attention across departments"
              flush
            >
              <AlertPanel alerts={overview.alerts} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <ChartCard
              title="Ward occupancy"
              description="Bed composition by ward"
            >
              <WardOccupancyChart data={overview.wardOccupancy} />
            </ChartCard>
            <ChartCard
              title="Blood inventory"
              description="Units by blood group"
            >
              <BloodInventoryPanel groups={overview.bloodInventory} />
            </ChartCard>
            <ChartCard
              title="Prescription queue"
              description="Orders awaiting pharmacy"
              flush
            >
              <PrescriptionQueuePanel tasks={overview.prescriptionQueue} />
            </ChartCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard
              title="Organ matching"
              description="Active matches this week"
              flush
            >
              <OrganMatchingPanel matches={overview.organMatches} />
            </ChartCard>
            <ChartCard
              title="Recent activity"
              description="Latest events across the facility"
              className="xl:col-span-2"
              flush
            >
              {activity?.length ? (
                <ActivityTimeline events={activity} />
              ) : (
                <EmptyState
                  title="No recent activity"
                  description="Events will appear as care is coordinated."
                />
              )}
            </ChartCard>
          </div>

          <section aria-label="Quick actions">
            <ChartCard
              title="Quick actions"
              description="Jump straight into a workflow"
            >
              <QuickActions />
            </ChartCard>
          </section>
        </>
      )}
    </Container>
  )
}