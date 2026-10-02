import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/common/form-field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  AdmissionType,
  Gender,
  NewPatientInput,
  Patient,
} from '@/types/clinical'
import {
  ADMISSION_TYPE_OPTIONS,
  ALLERGY_OPTIONS,
  BLOOD_GROUPS,
  DOCTOR_OPTIONS,
  NURSE_OPTIONS,
  PATIENT_DEPARTMENTS,
} from '@/data/mock/patients'
import { WARD_NAMES } from '@/lib/clinical-options'

const genderLabels: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
}

const patientSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Enter the patient’s full legal name.'),
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required.')
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: 'Enter a valid date of birth.',
      })
      .refine((value) => new Date(value).getTime() <= Date.now(), {
        message: 'Date of birth cannot be in the future.',
      }),
    gender: z.enum(['male', 'female', 'other']),
    bloodGroup: z.enum(['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−']),
    phone: z
      .string()
      .trim()
      .min(7, 'Enter a contact number.')
      .refine((value) => /^[+\d][\d\s-]{6,}$/.test(value), {
        message: 'Enter a valid phone number.',
      }),
    emergencyContact: z
      .string()
      .trim()
      .min(5, 'Enter a name and contact for the emergency contact.'),
    department: z.string().min(1, 'Select a department.'),
    ward: z.string().min(1, 'Select a ward.'),
    bed: z.string(),
    attendingDoctor: z.string().min(1, 'Select the attending doctor.'),
    assignedNurse: z.string().min(1, 'Select the assigned nurse.'),
    admissionType: z.enum(['emergency', 'elective', 'transfer', 'scheduled', 'day_care']),
    diagnosis: z.string().trim().min(5, 'Enter a brief presenting diagnosis.'),
    allergies: z.array(z.string()),
  })
  .refine((data) => data.allergies.length > 0, {
    message: 'Mark at least one allergy option (use “No known allergies”).',
    path: ['allergies'],
  })

type PatientFormValues = z.infer<typeof patientSchema>

function toFormValues(initial?: Patient): PatientFormValues {
  return {
    fullName: initial?.fullName ?? '',
    dateOfBirth: initial?.dateOfBirth ?? '',
    gender: initial?.gender ?? 'female',
    bloodGroup: (initial?.bloodGroup ?? 'O+') as PatientFormValues['bloodGroup'],
    phone: initial?.phone ?? '',
    emergencyContact: initial?.emergencyContact ?? '',
    department: initial?.department ?? PATIENT_DEPARTMENTS[0],
    ward: initial?.ward ?? '',
    bed: initial?.bed ?? '',
    attendingDoctor: initial?.attendingDoctor ?? '',
    assignedNurse: initial?.assignedNurse ?? '',
    admissionType: initial?.admissionType ?? 'elective',
    diagnosis: initial?.diagnosis ?? '',
    allergies: initial?.allergies.length ? initial.allergies : ['No known allergies'],
  }
}

function toNewPatientInput(values: PatientFormValues): NewPatientInput {
  return {
    ...values,
    fullName: values.fullName.trim(),
    allergies: values.allergies,
  }
}

interface PatientFormProps {
  initial?: Patient
  /** Beds eligible for assignment, grouped by ward name. */
  bedsByWard: Readonly<Record<string, ReadonlyArray<string>>>
  busy: boolean
  onSave: (input: NewPatientInput) => void
  onCancel: () => void
}

/**
 * Add / edit patient form (React Hook Form + Zod). Bed options are the
 * available beds for the selected ward, so assignments stay consistent.
 */
export function PatientForm({
  initial,
  bedsByWard,
  busy,
  onSave,
  onCancel,
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: toFormValues(initial),
  })

  const ward = watch('ward')
  const allergies = watch('allergies')
  const bedOptions = useMemo(
    () => (ward ? (bedsByWard[ward] ?? []) : []),
    [ward, bedsByWard],
  )
  const bedOptionsWithCurrent = useMemo(() => {
    const list = [...bedOptions]
    if (initial?.ward === ward && initial.bed && !list.includes(initial.bed)) {
      list.push(initial.bed)
    }
    return list.sort()
  }, [bedOptions, initial, ward])

  const toggleAllergy = (option: string, checked: boolean) => {
    const current = checked
      ? [...allergies, option]
      : allergies.filter((entry) => entry !== option)
    setValue('allergies', current, { shouldValidate: true })
  }

  const submit = handleSubmit((values) => onSave(toNewPatientInput(values)))

  return (
    <form onSubmit={submit} className="grid gap-4" aria-label="Patient details form">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="fullName"
          label="Full name"
          required
          error={errors.fullName?.message}
          className="sm:col-span-2"
        >
          <Input
            id="fullName"
            placeholder="e.g. Shefali Chowdhury"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            {...register('fullName')}
          />
        </FormField>

        <FormField
          id="dateOfBirth"
          label="Date of birth"
          required
          error={errors.dateOfBirth?.message}
        >
          <Input
            id="dateOfBirth"
            type="date"
            aria-invalid={Boolean(errors.dateOfBirth)}
            aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
            {...register('dateOfBirth')}
          />
        </FormField>

        <FormField id="gender" label="Gender" required error={errors.gender?.message}>
          <Select
            defaultValue={watch('gender')}
            onValueChange={(value) => setValue('gender', value as Gender, { shouldValidate: true })}
          >
            <SelectTrigger aria-label="Gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(genderLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="bloodGroup"
          label="Blood group"
          required
          error={errors.bloodGroup?.message}
        >
          <Select
            defaultValue={watch('bloodGroup')}
            onValueChange={(value) =>
              setValue('bloodGroup', value as PatientFormValues['bloodGroup'], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger aria-label="Blood group">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="phone" label="Phone" required error={errors.phone?.message}>
          <Input
            id="phone"
            inputMode="tel"
            placeholder="+8801XXXXXXXXX"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            {...register('phone')}
          />
        </FormField>

        <FormField
          id="emergencyContact"
          label="Emergency contact"
          required
          error={errors.emergencyContact?.message}
        >
          <Input
            id="emergencyContact"
            placeholder="Name (relationship) · number"
            aria-invalid={Boolean(errors.emergencyContact)}
            aria-describedby={
              errors.emergencyContact ? 'emergencyContact-error' : undefined
            }
            {...register('emergencyContact')}
          />
        </FormField>

        <FormField
          id="department"
          label="Department"
          required
          error={errors.department?.message}
        >
          <Select
            defaultValue={watch('department')}
            onValueChange={(value) =>
              setValue('department', value, { shouldValidate: true })
            }
          >
            <SelectTrigger aria-label="Department">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PATIENT_DEPARTMENTS.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="ward" label="Ward" required error={errors.ward?.message}>
          <Select
            defaultValue={watch('ward')}
            onValueChange={(value) => {
              setValue('ward', value, { shouldValidate: true })
              setValue('bed', '', { shouldValidate: true })
            }}
          >
            <SelectTrigger aria-label="Ward">
              <SelectValue placeholder="Select a ward" />
            </SelectTrigger>
            <SelectContent>
              {WARD_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="bed"
          label="Bed"
          hint={bedOptions.length ? 'Available beds in the selected ward.' : 'Pick a ward first.'}
          error={errors.bed?.message}
        >
          <Select
            value={watch('bed')}
            onValueChange={(value) => setValue('bed', value, { shouldValidate: true })}
          >
            <SelectTrigger aria-label="Bed">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {bedOptionsWithCurrent.map((bed) => (
                <SelectItem key={bed} value={bed}>
                  {bed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="attendingDoctor"
          label="Attending doctor"
          required
          error={errors.attendingDoctor?.message}
        >
          <Select
            defaultValue={watch('attendingDoctor')}
            onValueChange={(value) =>
              setValue('attendingDoctor', value, { shouldValidate: true })
            }
          >
            <SelectTrigger aria-label="Attending doctor">
              <SelectValue placeholder="Select a doctor" />
            </SelectTrigger>
            <SelectContent>
              {DOCTOR_OPTIONS.map((doctor) => (
                <SelectItem key={doctor} value={doctor}>
                  {doctor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="assignedNurse"
          label="Assigned nurse"
          required
          error={errors.assignedNurse?.message}
        >
          <Select
            defaultValue={watch('assignedNurse')}
            onValueChange={(value) =>
              setValue('assignedNurse', value, { shouldValidate: true })
            }
          >
            <SelectTrigger aria-label="Assigned nurse">
              <SelectValue placeholder="Select a nurse" />
            </SelectTrigger>
            <SelectContent>
              {NURSE_OPTIONS.map((nurse) => (
                <SelectItem key={nurse} value={nurse}>
                  {nurse}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="admissionType"
          label="Admission type"
          required
          error={errors.admissionType?.message}
        >
          <Select
            defaultValue={watch('admissionType')}
            onValueChange={(value) =>
              setValue('admissionType', value as AdmissionType, { shouldValidate: true })
            }
          >
            <SelectTrigger aria-label="Admission type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMISSION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="diagnosis"
          label="Presenting diagnosis"
          required
          error={errors.diagnosis?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="diagnosis"
            rows={3}
            placeholder="Brief reason for admission / presenting complaint"
            aria-invalid={Boolean(errors.diagnosis)}
            aria-describedby={errors.diagnosis ? 'diagnosis-error' : undefined}
            {...register('diagnosis')}
          />
        </FormField>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Allergies</legend>
        {errors.allergies ? (
          <p id="allergies-error" className="mt-1 text-xs font-medium text-destructive">
            {errors.allergies.message}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((option) => {
            const checked = allergies.includes(option)
            return (
              <label
                key={option}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  checked
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => toggleAllergy(option, Boolean(value))}
                  aria-label={option}
                />
                {option}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Admit patient'}
        </Button>
      </div>
    </form>
  )
}