import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  BadgeCheck,
  CircleSlash,
  Clock,
  FlaskConical,
  Send,
  Stethoscope,
  TriangleAlert,
} from 'lucide-react'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  PharmacyStatusBadge,
  PrescriptionStatusBadge,
} from '@/components/pharmacy/pharmacy-status-badges'
import { PrescriptionWarnings } from '@/components/pharmacy/prescription-warnings'
import {
  PRESCRIPTION_STATUS_LABELS,
  type PrescriptionStatus,
} from '@/types/pharmacy'
import { useSession } from '@/hooks/use-auth'
import { isClinician, isPharmacist } from '@/lib/roles'
import { pharmacyService } from '@/services'
import { formatDateTime } from '@/lib/clinical'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/** Prescription detail: medication lines, simulated safety flags and lifecycle actions. */
export function PharmacyPrescriptionDetailPage() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>()
  const session = useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: prescription, isLoading, isError, refetch } = useQuery({
    queryKey: ['pharmacy', 'prescriptions', prescriptionId],
    queryFn: () => pharmacyService.getPrescription(prescriptionId ?? ''),
    enabled: Boolean(prescriptionId),
  })

  const clinician = isClinician(session?.user.role)
  const pharmacist = isPharmacist(session?.user.role)
  const actorName = session?.user.fullName ?? 'System'

  const statusMutation = useMutation({
    mutationFn: (status: PrescriptionStatus) =>
      pharmacyService.updatePrescriptionStatus(prescription?.prescriptionId ?? '', status, actorName),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'prescriptions', prescriptionId] })
      toast.success(`${updated.prescriptionId} is now ${PRESCRIPTION_STATUS_LABELS[updated.status]}.`)
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Could not update the prescription.'),
  })

  const warnCount = useMemo(() => prescription?.warnings.length ?? 0, [prescription])

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-64 rounded-xl lg:col-span-2" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </Container>
    )
  }

  if (isError || !prescription) {
    return (
      <Container>
        {isError ? (
          <ErrorState
            title="Could not load prescription"
            description="The requested prescription could not be read. Please try again."
            onRetry={() => void refetch()}
          />
        ) : (
          <EmptyState
            title="Prescription not found"
            description={`No prescription matches ${prescriptionId ?? 'this ID'}. It may have been removed.`}
          />
        )}
      </Container>
    )
  }

  const isOpen = prescription.status === 'draft' || prescription.status === 'active' || prescription.status === 'sent'

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-3 -ms-2">
            <Link to="/app/pharmacy/prescriptions">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to prescriptions
            </Link>
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{prescription.prescriptionId}</h1>
              <p className="text-sm text-muted-foreground">
                Created {formatDateTime(prescription.createdAt)} by {prescription.doctorName}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PrescriptionStatusBadge status={prescription.status} />
              <PharmacyStatusBadge status={prescription.pharmacyStatus} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Stethoscope aria-hidden="true" className="size-4 text-primary" />
                  Patient & indication
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="text-sm font-medium">{prescription.patientName}</p>
                  <p className="text-xs text-muted-foreground">{prescription.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prescriber</p>
                  <p className="text-sm font-medium">{prescription.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{prescription.doctorId}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="text-sm font-medium">{prescription.diagnosis}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FlaskConical aria-hidden="true" className="size-4 text-primary" />
                  Medication lines
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {prescription.medications.length} item{prescription.medications.length === 1 ? '' : 's'}
                </span>
              </CardHeader>
              <CardContent className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dose & frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescription.medications.map((medication, index) => {
                      const flagged = prescription.warnings.some(
                        (warning) => warning.medication === medication.medication,
                      )
                      return (
                        <TableRow key={`${medication.medication}-${index}`}>
                          <TableCell>
                            <p className="flex items-center gap-1.5 text-sm font-medium">
                              {flagged ? (
                                <TriangleAlert
                                  aria-hidden="true"
                                  className="size-3.5 text-amber-600 dark:text-amber-400"
                                />
                              ) : null}
                              {medication.medication}
                            </p>
                            <p className="text-xs text-muted-foreground">{medication.strength}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {medication.dosage} · {medication.frequency}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {medication.duration}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {medication.route}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium tabular-nums">
                            {medication.quantity}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              {prescription.medications.some((medication) => medication.instructions) ? (
                <div className="mt-3 space-y-2">
                  {prescription.medications
                    .filter((medication) => medication.instructions)
                    .map((medication, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{medication.medication}:</span>{' '}
                        {medication.instructions}
                      </p>
                    ))}
                </div>
              ) : null}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TriangleAlert aria-hidden="true" className="size-4 text-primary" />
                  Safety check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PrescriptionWarnings warnings={prescription.warnings} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock aria-hidden="true" className="size-4 text-primary" />
                  Lifecycle actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {warnCount > 0
                    ? `${warnCount} safety flag${warnCount === 1 ? '' : 's'} on this prescription. Approve or dispense only after review.`
                    : 'No safety flags — ready to move through the workflow.'}
                </p>
                {prescription.status === 'draft' && clinician ? (
                  <Button
                    className="w-full"
                    onClick={() => statusMutation.mutate('active')}
                    disabled={statusMutation.isPending}
                  >
                    <BadgeCheck aria-hidden="true" className="size-4" />
                    Approve prescription
                  </Button>
                ) : null}
                {prescription.status === 'active' && pharmacist ? (
                  <Button
                    className="w-full"
                    onClick={() => statusMutation.mutate('sent')}
                    disabled={statusMutation.isPending}
                  >
                    <Send aria-hidden="true" className="size-4" />
                    Send to pharmacy
                  </Button>
                ) : null}
                {prescription.status === 'sent' && pharmacist ? (
                  <Button
                    className="w-full"
                    onClick={() => statusMutation.mutate('dispensed')}
                    disabled={statusMutation.isPending}
                  >
                    <FlaskConical aria-hidden="true" className="size-4" />
                    Mark dispensed
                  </Button>
                ) : null}
                {isOpen && (clinician || pharmacist) ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => statusMutation.mutate('cancelled')}
                    disabled={statusMutation.isPending}
                  >
                    <CircleSlash aria-hidden="true" className="size-4" />
                    Cancel prescription
                  </Button>
                ) : null}
                {!clinician && !pharmacist ? (
                  <p className="text-xs text-muted-foreground">
                    You don't have permission to change this prescription's status.
                  </p>
                ) : null}
                {isOpen && !statusMutation.isPending ? (
                  <Button
                    className="w-full"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                  >
                    Back to list
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Alert variant="default">
              <TriangleAlert aria-hidden="true" className="size-4" />
              <AlertTitle>Demo only</AlertTitle>
              <AlertDescription>
                Status changes are simulated locally. No medication is physically dispensed by this
                interface.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </Container>
  )
}