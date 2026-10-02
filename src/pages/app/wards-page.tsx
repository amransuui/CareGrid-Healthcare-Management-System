import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Hourglass } from 'lucide-react'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BedDetailsDrawer,
  BedGrid,
  WardSummary,
} from '@/components/clinical'
import type { Bed, BedStatus, Patient } from '@/types/clinical'
import { patientService, wardService } from '@/services'

/** Wards & beds: occupancy summary, pending admissions and bed grid. */
export function WardsPage() {
  const queryClient = useQueryClient()
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)

  const {
    data: summary,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['wards', 'summary'],
    queryFn: () => wardService.summary(),
  })
  const { data: beds } = useQuery({
    queryKey: ['wards', 'beds'],
    queryFn: () => wardService.listBeds(),
  })
  const { data: pending } = useQuery({
    queryKey: ['wards', 'pending'],
    queryFn: () => wardService.pendingAdmissions(),
  })
  const { data: patients } = useQuery({
    queryKey: ['patients', 'list'],
    queryFn: () => patientService.list(),
  })

  const patientById = useMemo(
    () => new Map((patients ?? []).map((patient) => [patient.patientId, patient])),
    [patients],
  )

  const occupant: Patient | null = useMemo(
    () => (selectedBed?.patientId ? patientById.get(selectedBed.patientId) ?? null : null),
    [selectedBed, patientById],
  )

  const mutateStatus = useMutation({
    mutationFn: ({ bedId, status }: { bedId: string; status: BedStatus }) =>
      wardService.updateBedStatus(bedId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wards', 'summary'] })
      queryClient.invalidateQueries({ queryKey: ['wards', 'beds'] })
      queryClient.invalidateQueries({ queryKey: ['wards', 'pending'] })
      toast.success('Bed status updated')
    },
    onError: () => toast.error('Could not update the bed status.'),
  })

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Wards & Beds"
        description="Bed availability, occupancy and admission flow."
      />

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : summary ? (
        <>
          <WardSummary summary={summary} />

          <section aria-label="Pending admissions" className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <Hourglass aria-hidden="true" className="size-4 text-muted-foreground" />
              Pending admissions
            </h2>
            {pending?.length ? (
              <ul className="grid gap-3 sm:grid-cols-3">
                {pending.map((entry) => (
                  <li key={entry.patientId} className="rounded-lg border bg-muted/40 p-3">
                    <p className="text-sm font-medium">{entry.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.patientId} · {entry.attendingDoctor}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Bed assignment: {entry.assignedNurse} (nurse)
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No pending admissions"
                description="Admission requests will appear here."
              />
            )}
          </section>

          <section aria-label="Bed layout" className="flex items-start gap-2">
            <BedGrid
              beds={beds ?? []}
              patientById={patientById}
              onSelect={(bed) => setSelectedBed(bed)}
            />
          </section>
        </>
      ) : null}

      <BedDetailsDrawer
        bed={selectedBed}
        patient={occupant}
        open={Boolean(selectedBed)}
        busy={mutateStatus.isPending}
        onOpenChange={(open) => {
          if (!open) setSelectedBed(null)
        }}
        onUpdateStatus={(status) => {
          if (selectedBed) {
            mutateStatus.mutate({ bedId: selectedBed.id, status })
          }
        }}
      />
    </Container>
  )
}