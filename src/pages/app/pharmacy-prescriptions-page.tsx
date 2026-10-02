import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FilePenLine, FlaskConical, Ribbon, Send } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { PrescriptionTable } from '@/components/pharmacy/prescription-table'
import { CreatePrescriptionDialog } from '@/components/pharmacy/create-prescription-dialog'
import { useSession } from '@/hooks/use-auth'
import { isClinician } from '@/lib/roles'
import { patientService, pharmacyService } from '@/services'
import { timeAgo } from '@/lib/time'

const DAY_MS = 86_400_000

/** E-prescription dashboard: review, send to pharmacy and track fulfilment. */
export function PharmacyPrescriptionsPage() {
  const session = useSession()
  const clinician = isClinician(session?.user.role)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)

  const prescriptionsQuery = useQuery({
    queryKey: ['pharmacy', 'prescriptions'],
    queryFn: () => pharmacyService.listPrescriptions(),
  })
  const patientsQuery = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.list(),
  })
  const alertsQuery = useQuery({
    queryKey: ['pharmacy', 'alerts'],
    queryFn: () => pharmacyService.listAlerts(),
  })

  const prescriptions = prescriptionsQuery.data ?? []
  const alerts = alertsQuery.data ?? []

  const kpis = useMemo(() => {
    const now = Date.now()
    return {
      pendingApproval: prescriptions.filter((prescription) => prescription.status === 'draft').length,
      awaitingPharmacy: prescriptions.filter(
        (prescription) => prescription.status === 'active' || prescription.status === 'sent',
      ).length,
      dispensed30d: prescriptions.filter(
        (prescription) =>
          prescription.status === 'dispensed' &&
          now - new Date(prescription.createdAt).getTime() <= 30 * DAY_MS,
      ).length,
      openAlerts: alerts.filter(
        (alert) => alert.status === 'new' || alert.status === 'reviewing',
      ).length,
    }
  }, [prescriptions, alerts])

  const patientOptions = useMemo(
    () => [...new Set(prescriptions.map((prescription) => prescription.patientName))],
    [prescriptions],
  )
  const doctorOptions = useMemo(
    () => [...new Set(prescriptions.map((prescription) => prescription.doctorName))],
    [prescriptions],
  )

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof pharmacyService.createPrescription>[0]) =>
      pharmacyService.createPrescription(input),
    onSuccess: (prescription) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'alerts'] })
      toast.success(`Prescription ${prescription.prescriptionId} created — awaiting approval.`)
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Could not create the prescription.'),
  })

  if (prescriptionsQuery.isLoading || patientsQuery.isLoading) {
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

  if (prescriptionsQuery.isError || patientsQuery.isError) {
    return (
      <Container>
        <ErrorState
          title="Could not load prescriptions"
          description="The pharmacy module could not read its data. Please try again."
          onRetry={() => {
            void prescriptionsQuery.refetch()
            void patientsQuery.refetch()
          }}
        />
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <PageHeader
          title="E-prescriptions"
          description="Draft, approve and send prescriptions to the pharmacy. Updated in real time from the demo service."
          actions={
            clinician ? (
              <Button onClick={() => setCreateOpen(true)}>
                <FilePenLine aria-hidden="true" className="size-4" />
                New prescription
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Prescribing requires a clinician account.</p>
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Pending approval"
            value={kpis.pendingApproval}
            context="Draft prescriptions awaiting clinician review"
            icon={FilePenLine}
            tone="info"
          />
          <KpiCard
            label="Awaiting pharmacy"
            value={kpis.awaitingPharmacy}
            context="Approved or sent prescriptions to be handled"
            icon={Send}
            tone="warning"
          />
          <KpiCard
            label="Dispensed (30d)"
            value={kpis.dispensed30d}
            context="Prescriptions completed in the last 30 days"
            icon={FlaskConical}
            tone="success"
          />
          <KpiCard
            label="Safety alerts"
            value={kpis.openAlerts}
            context="Open allergy, interaction and stock alerts"
            icon={Ribbon}
            tone="critical"
          />
        </div>

        <PrescriptionTable
          prescriptions={prescriptions}
          patientOptions={patientOptions}
          doctorOptions={doctorOptions}
          onView={(prescription) => navigate(`/app/pharmacy/prescriptions/${prescription.prescriptionId}`)}
        />

        <div className="text-xs text-muted-foreground">
          {prescriptionsQuery.dataUpdatedAt ? `Data refreshed ${timeAgo(new Date(prescriptionsQuery.dataUpdatedAt))}. ` : ''}
          Demo data — dispensed amounts and alerts are simulated.
        </div>
      </div>

      <CreatePrescriptionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        patients={patientsQuery.data ?? []}
        doctorName={session?.user.fullName ?? 'Unknown prescriber'}
        onSubmit={async (input, doctorName) => {
          await createMutation.mutateAsync({
            ...input,
            doctorId: session?.user.id ?? 'usr-unknown',
            doctorName,
          })
        }}
      />
    </Container>
  )
}