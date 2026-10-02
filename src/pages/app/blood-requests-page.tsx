import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CircleDashed, CircleCheck, CircleX, Loader2 } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { BloodRequestDrawer, BloodRequestTable } from '@/components/blood'
import type { BloodRequest, BloodRequestStatus } from '@/types/blood'
import { useSession } from '@/hooks/use-auth'
import { isBloodBankCoordinator } from '@/lib/roles'
import { bloodService } from '@/services'

/** Blood request queue with coordinator status updates. */
export function BloodRequestsPage() {
  const session = useSession()
  const coordinator = isBloodBankCoordinator(session?.user.role)
  const queryClient = useQueryClient()
  const [viewed, setViewed] = useState<BloodRequest | null>(null)

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ['blood', 'requests'],
    queryFn: () => bloodService.listRequests(),
  })

  const kpis = useMemo(() => {
    const items = requests ?? []
    return {
      pending: items.filter((request) => request.status === 'pending').length,
      processing: items.filter((request) => request.status === 'processing').length,
      fulfilled: items.filter((request) => request.status === 'fulfilled').length,
      cancelled: items.filter((request) => request.status === 'cancelled').length,
    }
  }, [requests])

  const mutateStatus = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: BloodRequestStatus }) =>
      bloodService.updateRequestStatus(requestId, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['blood', 'requests'] })
      setViewed((current) => (current?.requestId === updated.requestId ? updated : current))
      toast.success(`Request ${updated.requestId} updated`)
    },
    onError: () => toast.error('Could not update the request.'),
  })

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Blood Requests"
        description="Cross-hospital blood component request queue."
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
              label="Pending"
              value={kpis.pending}
              context="Awaiting coordinator action"
              icon={CircleDashed}
              tone="warning"
            />
            <KpiCard
              label="Processing"
              value={kpis.processing}
              context="Being prepared"
              icon={Loader2}
              tone="info"
            />
            <KpiCard
              label="Fulfilled"
              value={kpis.fulfilled}
              context="Dispatched to ward"
              icon={CircleCheck}
              tone="success"
            />
            <KpiCard
              label="Cancelled"
              value={kpis.cancelled}
              context="Not fulfilled"
              icon={CircleX}
            />
          </div>

          <BloodRequestTable requests={requests ?? []} onView={setViewed} />
        </>
      )}

      <BloodRequestDrawer
        request={viewed}
        canAct={coordinator}
        busy={mutateStatus.isPending}
        onStatusChange={(status) =>
          viewed ? mutateStatus.mutate({ requestId: viewed.requestId, status }) : undefined
        }
        onOpenChange={(open) => {
          if (!open) setViewed(null)
        }}
      />
    </Container>
  )
}