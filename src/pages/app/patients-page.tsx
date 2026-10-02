import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PenLine, Plus, UserPlus } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  EMPTY_PATIENT_FILTERS,
  PatientFilters,
  PatientForm,
  PatientTable,
  RecordVitalsDialog,
} from '@/components/clinical'
import type {
  NewPatientInput,
  Patient,
  RecordVitalsInput,
} from '@/types/clinical'
import { useSession } from '@/hooks/use-auth'
import { isClinician } from '@/lib/roles'
import { patientService, vitalsService, wardService } from '@/services'

/** Role-gated: only clinical staff can add patients / record vitals. */

export function PatientListPage() {
  const session = useSession()
  const clinician = isClinician(session?.user.role)
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState(EMPTY_PATIENT_FILTERS)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [recordPatient, setRecordPatient] = useState<Patient | null>(null)

  const { data: patients, isLoading, isError, refetch } = useQuery({
    queryKey: ['patients', 'list'],
    queryFn: () => patientService.list(),
  })
  const { data: readings } = useQuery({
    queryKey: ['vitals', 'latest'],
    queryFn: () => vitalsService.latestReadings(),
  })
  const { data: beds } = useQuery({
    queryKey: ['wards', 'beds'],
    queryFn: () => wardService.listBeds(),
  })

  const patientById = useMemo(
    () => new Map((patients ?? []).map((patient) => [patient.patientId, patient])),
    [patients],
  )
  const readingsById = useMemo(
    () => new Map((readings ?? []).map((reading) => [reading.patientId, reading])),
    [readings],
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

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return (patients ?? []).filter((patient) => {
      if (filters.status !== 'all' && patient.status !== filters.status) return false
      if (filters.ward !== 'all' && patient.ward !== filters.ward) return false
      if (filters.department !== 'all' && patient.department !== filters.department) {
        return false
      }
      if (filters.bloodGroup !== 'all' && patient.bloodGroup !== filters.bloodGroup) {
        return false
      }
      if (q) {
        const matches =
          patient.fullName.toLowerCase().includes(q) ||
          patient.patientId.toLowerCase().includes(q) ||
          patient.phone.toLowerCase().includes(q) ||
          patient.attendingDoctor.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [patients, filters])

  const mutateAdd = useMutation({
    mutationFn: (input: NewPatientInput) => patientService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['wards', 'beds'] })
      toast.success('Patient admitted')
      setAddOpen(false)
    },
    onError: () => toast.error('Could not admit the patient.'),
  })

  const mutateEdit = useMutation({
    mutationFn: ({ id, input }: { id: string; input: NewPatientInput }) =>
      patientService.update({ ...input, patientId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['wards', 'beds'] })
      toast.success('Patient record updated')
      setEditing(null)
    },
    onError: () => toast.error('Could not update the patient record.'),
  })

  const mutateVitals = useMutation({
    mutationFn: (input: RecordVitalsInput) => vitalsService.record(input),
    onSuccess: (reading) => {
      queryClient.invalidateQueries({ queryKey: ['vitals', 'latest'] })
      queryClient.invalidateQueries({ queryKey: ['vitals', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['vitals', 'single'] })
      toast.success(`Vitals recorded for ${reading.patientId}`)
    },
    onError: () => toast.error('Could not record vitals.'),
  })

  const recorderName = session?.user.fullName ?? 'Clinical Staff'

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Patients"
        description="Patient directory and care coordination across wards."
        actions={
          clinician ? (
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus aria-hidden="true" className="size-4" />
              Add patient
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <PatientFilters filters={filters} onChange={setFilters} />
          <PatientTable
            patients={filtered}
            readingsById={readingsById}
            canRecord={clinician}
            canEdit={clinician}
            onRecordVitals={(patient) => setRecordPatient(patient)}
            onEdit={(patient) => setEditing(patient)}
          />
        </>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus aria-hidden="true" className="size-4 text-primary" />
              Admit a patient
            </DialogTitle>
            <DialogDescription>
              Capture admission details. Any allergies list you select is demo
              data — fictional patient, no real record.
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            bedsByWard={bedsByWard}
            busy={mutateAdd.isPending}
            onSave={(input) => mutateAdd.mutate(input)}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null) }}>
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
            initial={editing ?? undefined}
            bedsByWard={bedsByWard}
            busy={mutateEdit.isPending}
            onSave={(input) =>
              editing
                ? mutateEdit.mutate({ id: editing.patientId, input })
                : undefined
            }
            onCancel={() => setEditing(null)}
          />
        </DialogContent>
      </Dialog>

      <RecordVitalsDialog
        open={Boolean(recordPatient)}
        onOpenChange={(open) => {
          if (!open) setRecordPatient(null)
        }}
        patient={recordPatient ?? undefined}
        patients={Array.from(patientById.values()).filter(
          (candidate) => candidate.status !== 'discharged',
        )}
        recorderName={recorderName}
        onSubmit={mutateVitals.mutateAsync}
      />
    </Container>
  )
}