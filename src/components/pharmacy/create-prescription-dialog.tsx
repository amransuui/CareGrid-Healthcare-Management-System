import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FilePenLine, Info, Plus, Trash2 } from 'lucide-react'
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
import { PHARMACY_MEDICINES, PHARMACY_CATEGORIES } from '@/data/mock/pharmacy'
import { VITALS_DISCLAIMER } from '@/lib/clinical'
import type { NewPrescriptionInput, PrescriptionMedication } from '@/types/pharmacy'
import type { Patient } from '@/types/clinical'

const medicationSchema = z.object({
  medication: z.string().min(1, 'Select a medication.'),
  strength: z.string().min(1, 'Required.'),
  dosage: z.string().min(1, 'Required.'),
  frequency: z.string().min(1, 'Required.'),
  duration: z.string().min(1, 'Required.'),
  route: z.string().min(1, 'Required.'),
  instructions: z.string().max(300, 'Keep instructions under 300 characters.').optional(),
  quantity: z.number({ message: 'Enter a numeric quantity.' }).int('Use whole units.').min(1, 'At least 1 unit.'),
})

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Select a patient.'),
  diagnosis: z.string().min(3, 'Add a short diagnosis or indication.').max(200),
  medications: z.array(medicationSchema).min(1, 'Add at least one medication.'),
})

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

interface CreatePrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: Patient[]
  doctorName: string
  onSubmit: (input: NewPrescriptionInput, doctorName: string) => Promise<void>
}

function emptyMedication(rowIndex: number): PrescriptionMedication {
  return {
    medication: '',
    strength: '',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '7 days',
    route: 'Oral',
    instructions: '',
    quantity: rowIndex === 0 ? 14 : 14,
  }
}

const FREQUENCIES = ['Once daily', 'Twice daily', '3 times daily', '4 times daily', 'Every 6 hours', 'Every 8 hours', 'As needed']
const ROUTES = ['Oral', 'Sublingual', 'Inhalation', 'Topical', 'Subcutaneous', 'Intramuscular', 'Intravenous', 'Rectal']

/** New prescription form (RHF + Zod + useFieldArray) for clinicians. */
export function CreatePrescriptionDialog({
  open,
  onOpenChange,
  patients,
  doctorName,
  onSubmit,
}: CreatePrescriptionDialogProps) {
  const [busy, setBusy] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: { patientId: '', diagnosis: '', medications: [emptyMedication(0)] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'medications' })

  const selectedMedicationName = (index: number): string | undefined =>
    watch(`medications.${index}.medication`)

  const medicineFor = (name: string) =>
    PHARMACY_MEDICINES.find((medicine) => medicine.name === name)

  const close = () => {
    if (!busy) onOpenChange(false)
  }

  const submit = handleSubmit(async (values) => {
    setBusy(true)
    try {
      await onSubmit(
        {
          patientId: values.patientId,
          diagnosis: values.diagnosis,
          medications: values.medications.map((medication) => ({
            medication: medication.medication,
            strength: medication.strength,
            dosage: medication.dosage,
            frequency: medication.frequency,
            duration: medication.duration,
            route: medication.route,
            instructions: medication.instructions ?? '',
            quantity: medication.quantity,
          })),
        },
        doctorName,
      )
      reset({ patientId: '', diagnosis: '', medications: [emptyMedication(0)] })
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : close())}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePenLine aria-hidden="true" className="size-4 text-primary" />
            New prescription
          </DialogTitle>
          <DialogDescription>
            Create a fresh prescription for a patient. Medication lines are validated before saving.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-4">
            <FormField id="patientId" label="Patient" required error={errors.patientId?.message}>
              <Select
                value={watch('patientId')}
                onValueChange={(value) => setValue('patientId', value, { shouldValidate: true })}
              >
                <SelectTrigger aria-label="Patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.patientId} value={patient.patientId}>
                      {patient.fullName} · {patient.patientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              id="diagnosis"
              label="Diagnosis / indication"
              required
              error={errors.diagnosis?.message}
            >
              <Textarea
                id="diagnosis"
                rows={2}
                aria-invalid={Boolean(errors.diagnosis)}
                aria-describedby={errors.diagnosis ? 'diagnosis-error' : undefined}
                {...register('diagnosis')}
              />
            </FormField>
          </div>

          <fieldset className="grid gap-4">
            <legend className="text-sm font-medium">Medications</legend>
            {fields.map((field, index) => {
              const med = medicineFor(selectedMedicationName(index) ?? '')
              const medErrors = errors.medications?.[index]
              return (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-xl border bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Line {index + 1}</p>
                    {fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" className="size-3.5" />
                        <span className="sr-only">Remove medication line {index + 1}</span>
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      id={`medications.${index}.medication`}
                      label="Medication"
                      required
                      error={medErrors?.medication?.message}
                    >
                      <Select
                        value={watch(`medications.${index}.medication`) ?? ''}
                        onValueChange={(value) => {
                          setValue(`medications.${index}.medication`, value, { shouldValidate: true })
                          const selected = medicineFor(value)
                          if (selected) {
                            setValue(`medications.${index}.strength`, selected.strength, {
                              shouldValidate: true,
                            })
                          }
                        }}
                      >
                        <SelectTrigger aria-label={`Medication for line ${index + 1}`}>
                          <SelectValue placeholder="Select a medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {PHARMACY_MEDICINES.map((medicine) => (
                            <SelectItem key={medicine.medicineId} value={medicine.name}>
                              {medicine.name} {medicine.strength} — {PHARMACY_CATEGORIES.find(
                                (category) => category === medicine.category,
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField
                      id={`medications.${index}.strength`}
                      label="Strength"
                      required
                      error={medErrors?.strength?.message}
                    >
                      <Input
                        id={`medications.${index}.strength`}
                        aria-invalid={Boolean(medErrors?.strength)}
                        aria-describedby={medErrors?.strength ? `medications.${index}.strength-error` : undefined}
                        placeholder={med?.strength ?? 'e.g. 500 mg'}
                        {...register(`medications.${index}.strength`)}
                      />
                    </FormField>
                    <FormField
                      id={`medications.${index}.dosage`}
                      label="Dosage"
                      required
                      error={medErrors?.dosage?.message}
                    >
                      <Input
                        id={`medications.${index}.dosage`}
                        aria-invalid={Boolean(medErrors?.dosage)}
                        aria-describedby={medErrors?.dosage ? `medications.${index}.dosage-error` : undefined}
                        placeholder="e.g. 1 tablet"
                        {...register(`medications.${index}.dosage`)}
                      />
                    </FormField>
                    <FormField
                      id={`medications.${index}.frequency`}
                      label="Frequency"
                      required
                      error={medErrors?.frequency?.message}
                    >
                      <Select
                        value={watch(`medications.${index}.frequency`) ?? ''}
                        onValueChange={(value) =>
                          setValue(`medications.${index}.frequency`, value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger aria-label={`Frequency for line ${index + 1}`}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map((frequency) => (
                            <SelectItem key={frequency} value={frequency}>
                              {frequency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField
                      id={`medications.${index}.duration`}
                      label="Duration"
                      required
                      error={medErrors?.duration?.message}
                    >
                      <Input
                        id={`medications.${index}.duration`}
                        aria-invalid={Boolean(medErrors?.duration)}
                        aria-describedby={medErrors?.duration ? `medications.${index}.duration-error` : undefined}
                        placeholder="e.g. 7 days"
                        {...register(`medications.${index}.duration`)}
                      />
                    </FormField>
                    <FormField
                      id={`medications.${index}.route`}
                      label="Route"
                      required
                      error={medErrors?.route?.message}
                    >
                      <Select
                        value={watch(`medications.${index}.route`) ?? ''}
                        onValueChange={(value) =>
                          setValue(`medications.${index}.route`, value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger aria-label={`Route for line ${index + 1}`}>
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROUTES.map((route) => (
                            <SelectItem key={route} value={route}>
                              {route}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField
                      id={`medications.${index}.quantity`}
                      label="Quantity"
                      required
                      hint="Total units of this medicine."
                      error={medErrors?.quantity?.message}
                    >
                      <Input
                        id={`medications.${index}.quantity`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        aria-invalid={Boolean(medErrors?.quantity)}
                        aria-describedby={
                          medErrors?.quantity
                            ? `medications.${index}.quantity-error`
                            : `medications.${index}.quantity-hint`
                        }
                        {...register(`medications.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </FormField>
                  </div>
                  <FormField
                    id={`medications.${index}.instructions`}
                    label="Instructions"
                    hint="e.g. after food, empty stomach, avoid driving."
                    error={medErrors?.instructions?.message}
                  >
                    <Textarea
                      id={`medications.${index}.instructions`}
                      rows={2}
                      aria-invalid={Boolean(medErrors?.instructions)}
                      aria-describedby={medErrors?.instructions ? `medications.${index}.instructions-error` : undefined}
                      {...register(`medications.${index}.instructions`)}
                    />
                  </FormField>
                </div>
              )
            })}
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(emptyMedication(fields.length))}
              >
                <Plus aria-hidden="true" className="size-3.5" />
                Add medication
              </Button>
            </div>
            {errors.medications?.root?.message ? (
              <p className="text-xs font-medium text-destructive">{errors.medications.root.message}</p>
            ) : null}
          </fieldset>

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
              {busy ? 'Saving…' : 'Save prescription'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}