import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PenLine, Pill, Syringe } from 'lucide-react'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  CareTimeline,
  PatientForm,
  PatientStatusBadge,
  RecordVitalsDialog,
  VitalsLevelBadge,
} from '@/components/clinical'
import type {
  NewPatientInput,
  RecordVitalsInput,
} from '@/types/clinical'
import { useSession } from '@/hooks/use-auth'
import { buildCareTimeline } from '@/data/mock/clinical-events'
import { formatDate, formatDateTime, VITALS_DISCLAIMER, vitalsLevel } from '@/lib/clinical'
import { isClinician } from '@/lib/roles'
import { userInitials } from '@/lib/utils'
import { patientService, vitalsService, wardService } from '@/services'

function ReadingRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">
        {value}
        {unit ? <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span> : null}
      </dd>
    </div>
  )
}

interface PatientDetailPageProps {
  onNavigateOut?: () => void
}

/** Patient record: admission, contact, allergies, meds, vitals, timeline. */
export function PatientDetailPage({ onNavigateOut }: PatientDetailPageProps) {
  const { patientId } = useParams<{ patientId: string }>()
  const session = useSession()
  const clinician = isClinician(session?.user.role)
  const queryClient = useQueryClient()

  const [editOpen, setEditOpen] = useState(false)
  const [recordOpen, setRecordOpen] = useState(false)

  const id = patientId ?? ''

  const { data: patient, isLoading, isError, refetch } = useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientService.get(id),
    enabled: Boolean(id),
  })
  const { data: reading } = useQuery({
    queryKey: ['vitals', 'single', id],
    queryFn: () => vitalsService.getReading(id),
    enabled: Boolean(id),
  })
  const { data: beds } = useQuery({
    queryKey: ['wards', 'beds'],
    queryFn: () => wardService.listBeds(),
  })

  const events = useMemo(
    () => (patient ? buildCareTimeline(patient) : []),
    [patient],
  )

  const bedsByWard = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const bed of beds ?? []) {
      if (bed.status === 'available') {
        ;(map[bed.ward] ??= []).push(bed.number)
      }
    }
    return map
  }, [beds])

  const mutateUpdate = useMutation({
    mutationFn: (input: NewPatientInput) =>
      patientService.update({ ...input, patientId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['patients', id] })
      queryClient.invalidateQueries({ queryKey: ['wards', 'beds'] })
      toast.success('Patient record updated')
      setEditOpen(false)
    },
    onError: () => toast.error('Could not update the patient record.'),
  })

  const mutateVitals = useMutation({
    mutationFn: (input: RecordVitalsInput) => vitalsService.record(input),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['vitals', 'latest'] })
      queryClient.invalidateQueries({ queryKey: ['vitals', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['vitals', 'single'] })
      toast.success(`Vitals recorded (${saved.heartRate} bpm)`)
      setRecordOpen(false)
    },
    onError: () => toast.error('Could not record vitals.'),
  })

  if (isLoading) return <LoadingState rows={8} />
  if (isError || !patient) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Patient not found"
          description="This patient may have been removed or the link is incorrect."
          onRetry={() => refetch()}
          actions={
            <Button asChild variant="outline">
              <Link to="/app/patients">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back to patients
              </Link>
            </Button>
          }
        />
      </Container>
    )
  }

  const flag = reading ? vitalsLevel(reading) : null

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <Button asChild variant="ghost" size="sm" className="w-fit" onClick={onNavigateOut}>
        <Link to="/app/patients">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Patients
        </Link>
      </Button>

      <PageHeader
        title={patient.fullName}
        description={`${patient.patientId} · ${patient.ward}${patient.bed ? ` · Bed ${patient.bed}` : ''} · Admitted ${formatDate(patient.admissionDate)}`}
        actions={
          <>
            <PatientStatusBadge status={patient.status} />
            {clinician ? (
              <>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <PenLine aria-hidden="true" className="size-4" />
                  Edit record
                </Button>
                {patient.status !== 'discharged' ? (
                  <Button onClick={() => setRecordOpen(true)}>
                    <Syringe aria-hidden="true" className="size-4" />
                    Record vitals
                  </Button>
                ) : null}
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-center gap-4">
              <span
                className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
                aria-hidden="true"
              >
                {userInitials(patient.fullName)}
              </span>
              <dl className="grid flex-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Age / gender</dt>
                  <dd className="tabular-nums">
                    {patient.age} · {patient.gender === 'female' ? 'Female' : patient.gender === 'male' ? 'Male' : 'Other'}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Blood group</dt>
                  <dd className="tabular-nums">{patient.bloodGroup}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Admission type</dt>
                  <dd className="capitalize">{patient.admissionType.replace('_', ' ')}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Department</dt>
                  <dd>{patient.department}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Attending doctor</dt>
                  <dd>{patient.attendingDoctor}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Assigned nurse</dt>
                  <dd>{patient.assignedNurse}</dd>
                </div>
              </dl>
            </div>
            <Separator />
            <div>
              <h2 className="mb-1 text-sm font-medium">Presenting diagnosis</h2>
              <p className="text-sm text-muted-foreground">{patient.diagnosis}</p>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-1.5 text-sm font-medium">Clinical notes</h2>
            <p className="text-sm text-muted-foreground">{patient.notes ?? 'No notes recorded.'}</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 text-sm font-medium">Contact & emergency</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="tabular-nums">{patient.phone}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Date of birth</dt>
                  <dd className="tabular-nums">{formatDate(patient.dateOfBirth)}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-muted-foreground">Emergency contact</dt>
                  <dd>{patient.emergencyContact}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 text-sm font-medium">Allergies</h2>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.length ? (
                  patient.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                    >
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None recorded</span>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <Pill aria-hidden="true" className="size-4 text-muted-foreground" />
              Medications
            </h2>
            {patient.medications.length ? (
              <ul className="divide-y divide-border">
                {patient.medications.map((medication, index) => (
                  <li key={`${medication.name}-${index}`} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">{medication.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {medication.dosage} · {medication.frequency} · {medication.route}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                        medication.status === 'active'
                          ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400'
                          : medication.status === 'on_hold'
                            ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {medication.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No medications"
                description="No medications are recorded for this admission."
              />
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Latest vitals</h2>
              {flag && reading ? (
                <VitalsLevelBadge level={flag.level} label={flag.label} />
              ) : null}
            </div>
            {reading ? (
              <>
                <dl className="divide-y divide-border">
                  <ReadingRow label="Heart rate" value={String(reading.heartRate)} unit="bpm" />
                  <ReadingRow
                    label="Blood pressure"
                    value={`${reading.systolic}/${reading.diastolic}`}
                    unit="mmHg"
                  />
                  <ReadingRow
                    label="Temperature"
                    value={reading.temperature.toFixed(1)}
                    unit="°C"
                  />
                  <ReadingRow label="SpO₂" value={`${reading.spo2}%`} />
                  <ReadingRow
                    label="Respiratory rate"
                    value={String(reading.respiratoryRate)}
                    unit="b/min"
                  />
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">
                  Recorded {formatDateTime(reading.recordedAt)} by {reading.recordedBy}.{' '}
                  {reading.notes ? reading.notes : ''}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{VITALS_DISCLAIMER}</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to={`/app/vitals/${patient.patientId}`}>View vitals trend</Link>
                </Button>
              </>
            ) : (
              <EmptyState
                title="No vitals yet"
                description="Observations will appear once recorded."
              />
            )}
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium">Care timeline</h2>
            <CareTimeline events={events} />
          </section>
        </aside>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine aria-hidden="true" className="size-4 text-primary" />
              Edit patient record
            </DialogTitle>
            <DialogDescription>
              Update admission details. This is a demo — no real record changes.
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            initial={patient}
            bedsByWard={bedsByWard}
            busy={mutateUpdate.isPending}
            onSave={(input) =>
              mutateUpdate.mutate({ ...input, patientId: patient.patientId })
            }
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <RecordVitalsDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        patient={patient}
        patients={[patient]}
        recorderName={session?.user.fullName ?? 'Clinical Staff'}
        onSubmit={mutateVitals.mutateAsync}
      />
    </Container>
  )
}