import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Droplets, Radio, Siren, TriangleAlert, Users } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { SosBoard } from '@/components/blood'
import type { SosAction } from '@/types/blood'
import { useSession } from '@/hooks/use-auth'
import { isBloodBankCoordinator } from '@/lib/roles'
import { bloodService } from '@/services'

/** Emergency blood SOS command center with a demo broadcast workflow. */
export function BloodSosPage() {
  const session = useSession()
  const coordinator = isBloodBankCoordinator(session?.user.role)
  const queryClient = useQueryClient()

  const { data: cases, isLoading, isError, refetch } = useQuery({
    queryKey: ['blood', 'sos'],
    queryFn: () => bloodService.listSos(),
  })

  const kpis = useMemo(() => {
    const items = cases ?? []
    const active = items.filter((sos) => sos.responseStatus !== 'fulfilled')
    return {
      active: active.length,
      critical: active.filter((sos) => sos.patientPriority === 'critical').length,
      unitsNeeded: active.reduce((sum, sos) => sum + Math.max(0, sos.unitsRequired - sos.unitsSecured), 0),
      groups: new Set(active.map((sos) => sos.bloodGroup)).size,
      broadcasting: items.filter((sos) => sos.broadcastStatus === 'broadcasting').length,
    }
  }, [cases])

  const mutateSos = useMutation({
    mutationFn: ({ sosId, action }: { sosId: string; action: SosAction }) =>
      bloodService.advanceSos(sosId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blood', 'sos'] })
      toast.success('SOS case updated')
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Could not update the SOS case.'),
  })

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Emergency Blood SOS"
        description="Donor broadcast command center for time-critical requests."
      />

      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          <span className="font-medium">Demo functionality.</span> Broadcast, donor matching
          and fulfilment actions are simulated and stored in local state only. No SMS, email
          or push notification is sent.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <KpiCard
              label="Active SOS cases"
              value={kpis.active}
              context="Not yet fulfilled"
              icon={Siren}
              tone="critical"
            />
            <KpiCard
              label="Critical requests"
              value={kpis.critical}
              context="Critical patient priority"
              icon={TriangleAlert}
              tone="critical"
            />
            <KpiCard
              label="Units needed"
              value={kpis.unitsNeeded}
              context="Still to be secured"
              icon={Droplets}
              tone="warning"
            />
            <KpiCard
              label="Groups in shortage"
              value={kpis.groups}
              context="Blood groups under active SOS"
              icon={Users}
              tone="info"
            />
            <KpiCard
              label="Broadcast status"
              value={kpis.broadcasting}
              context="Currently broadcasting"
              icon={Radio}
              tone="info"
            />
          </div>

          <SosBoard
            cases={cases ?? []}
            canAct={coordinator}
            busy={mutateSos.isPending}
            onAction={(sosId, action) => mutateSos.mutate({ sosId, action })}
          />
        </>
      )}
    </Container>
  )
}