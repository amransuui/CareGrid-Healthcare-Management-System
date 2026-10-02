import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HeartPulse, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormField } from '@/components/common/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type {
  Patient,
  RecordVitalsInput,
} from '@/types/clinical'
import { VITALS_DISCLAIMER } from '@/lib/clinical'
import { userInitials } from '@/lib/utils'

function numericField(
  min: number,
  max: number,
  minMessage: string,
  maxMessage: string,
  integer: boolean,
) {
  let schema = z
    .number({ message: 'Enter a numeric value.' })
    .finite('Enter a numeric value.')
  if (integer) schema = schema.int('Use whole numbers.')
  return schema.min(min, minMessage).max(max, maxMessage)
}

const vitalsSchema = z.object({
  patientId: z.string().min(1, 'Select a patient.'),
  heartRate: numericField(
    20,
    250,
    'Heart rate looks too low to be valid.',
    'Heart rate looks too high to be valid.',
    true,
  ),
  systolic: numericField(
    50,
    260,
    'Systolic looks too low to be valid.',
    'Systolic looks too high to be valid.',
    true,
  ),
  diastolic: numericField(
    30,
    150,
    'Diastolic looks too low to be valid.',
    'Diastolic looks too high to be valid.',
    true,
  ),
  temperature: numericField(
    30,
    44,
    'Temperature looks too low to be valid.',
    'Temperature looks too high to be valid.',
    false,
  ),
  spo2: numericField(
    50,
    100,
    'SpO₂ must be at least 50% to be valid.',
    'SpO₂ cannot exceed 100%.',
    true,
  ),
  respiratoryRate: numericField(
    5,
    60,
    'Respiratory rate looks too low to be valid.',
    'Respiratory rate looks too high to be valid.',
    true,
  ),
  notes: z.string().max(300, 'Keep notes under 300 characters.').optional(),
})

type VitalsFormValues = z.infer<typeof vitalsSchema>

type VitalsDefaults = Omit<VitalsFormValues, 'patientId'>

function emptyDefaults(): VitalsDefaults {
  return {
    heartRate: 0,
    systolic: 0,
    diastolic: 0,
    temperature: 0,
    spo2: 0,
    respiratoryRate: 0,
    notes: '',
  }
}

interface RecordVitalsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-selected patient — hides the patient selector when provided. */
  patient?: Patient
  patients: Patient[]
  recorderName: string
  onSubmit: (input: RecordVitalsInput) => Promise<unknown>
}

/**
 * Record Vitals form dialog (RHF + Zod). Operates against the vitals service
 * and invalidates the vitals queries from the parent on success.
 */
export function RecordVitalsDialog({
  open,
  onOpenChange,
  patient,
  patients,
  recorderName,
  onSubmit,
}: RecordVitalsDialogProps) {
  const [busy, setBusy] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: { patientId: patient?.patientId ?? '', ...emptyDefaults() },
  })

  const fixedPatient = Boolean(patient)
  const numericProps = {
    inputMode: 'numeric' as const,
    type: 'number',
    step: 'any' as const,
  }

  const close = () => {
    if (!busy) onOpenChange(false)
  }

  const submit = handleSubmit(async (values) => {
    setBusy(true)
    try {
      await onSubmit({
        patientId: values.patientId,
        heartRate: values.heartRate,
        systolic: values.systolic,
        diastolic: values.diastolic,
        temperature: values.temperature,
        spo2: values.spo2,
        respiratoryRate: values.respiratoryRate,
        notes: values.notes,
        recordedBy: recorderName,
      })
      reset({ patientId: values.patientId, ...emptyDefaults() })
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : close())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse aria-hidden="true" className="size-4 text-primary" />
            Record vitals
          </DialogTitle>
          <DialogDescription>
            {patient
              ? `New observation for ${patient.fullName} (${patient.patientId}).`
              : 'Select a patient and record a new observation.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          {fixedPatient ? (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                aria-hidden="true"
              >
                {patient ? userInitials(patient.fullName) : ''}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{patient?.fullName}</p>
                <p className="text-xs text-muted-foreground">{patient?.patientId}</p>
              </div>
            </div>
          ) : (
            <FormField id="patientId" label="Patient" required error={errors.patientId?.message}>
              <Select
                value={watch('patientId')}
                onValueChange={(value) =>
                  setValue('patientId', value, { shouldValidate: true })
                }
              >
                <SelectTrigger aria-label="Patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((candidate) => (
                    <SelectItem key={candidate.patientId} value={candidate.patientId}>
                      {candidate.fullName} · {candidate.patientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FormField
              id="heartRate"
              label="Heart rate (bpm)"
              required
              error={errors.heartRate?.message}
            >
              <Input
                id="heartRate"
                {...numericProps}
                aria-invalid={Boolean(errors.heartRate)}
                aria-describedby={errors.heartRate ? 'heartRate-error' : undefined}
                {...register('heartRate', { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              id="systolic"
              label="Systolic (mmHg)"
              required
              error={errors.systolic?.message}
            >
              <Input
                id="systolic"
                {...numericProps}
                aria-invalid={Boolean(errors.systolic)}
                aria-describedby={errors.systolic ? 'systolic-error' : undefined}
                {...register('systolic', { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              id="diastolic"
              label="Diastolic (mmHg)"
              required
              error={errors.diastolic?.message}
            >
              <Input
                id="diastolic"
                {...numericProps}
                aria-invalid={Boolean(errors.diastolic)}
                aria-describedby={errors.diastolic ? 'diastolic-error' : undefined}
                {...register('diastolic', { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              id="temperature"
              label="Temperature (°C)"
              required
              error={errors.temperature?.message}
            >
              <Input
                id="temperature"
                {...numericProps}
                aria-invalid={Boolean(errors.temperature)}
                aria-describedby={errors.temperature ? 'temperature-error' : undefined}
                {...register('temperature', { valueAsNumber: true })}
              />
            </FormField>
            <FormField id="spo2" label="SpO₂ (%)" required error={errors.spo2?.message}>
              <Input
                id="spo2"
                {...numericProps}
                aria-invalid={Boolean(errors.spo2)}
                aria-describedby={errors.spo2 ? 'spo2-error' : undefined}
                {...register('spo2', { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              id="respiratoryRate"
              label="Resp. rate (b/min)"
              required
              error={errors.respiratoryRate?.message}
            >
              <Input
                id="respiratoryRate"
                {...numericProps}
                aria-invalid={Boolean(errors.respiratoryRate)}
                aria-describedby={
                  errors.respiratoryRate ? 'respiratoryRate-error' : undefined
                }
                {...register('respiratoryRate', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            id="notes"
            label="Notes"
            hint="Optional observations, e.g. pain severity or position."
            error={errors.notes?.message}
          >
            <Textarea
              id="notes"
              rows={2}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? 'notes-error' : undefined}
              {...register('notes')}
            />
          </FormField>

          <Alert variant="default">
            <Info aria-hidden="true" className="size-4" />
            <AlertTitle>Demo only</AlertTitle>
            <AlertDescription>{VITALS_DISCLAIMER}</AlertDescription>
          </Alert>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save reading'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}