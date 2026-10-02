import type { CareTimelineEvent, Patient } from '@/types/clinical'

/**
 * Care timeline generator. Deterministic per patient so navigation back and
 * forth stays consistent for a demo — content is fictional.
 */

interface EventSeed {
  offsetHours: number
  event: string
  department: string
  author: string
  authorRole: string
  status: 'completed' | 'in_progress' | 'pending' | 'info'
  statusLabel: string
}

function addHours(input: string, hours: number): string {
  return new Date(new Date(input).getTime() + hours * 3_600_000).toISOString()
}

export function buildCareTimeline(patient: Patient): CareTimelineEvent[] {
  const seeds: EventSeed[] = [
    {
      offsetHours: 0,
      event: `${patient.fullName.split(' ').at(-1)} admitted to ${patient.ward} (${patient.bed})`,
      department: patient.department,
      author: patient.assignedNurse,
      authorRole: 'Nurse',
      status: 'completed',
      statusLabel: 'Completed',
    },
    {
      offsetHours: 2,
      event: 'Initial assessment completed; baseline vitals recorded',
      department: patient.department,
      author: patient.assignedNurse,
      authorRole: 'Nurse',
      status: 'completed',
      statusLabel: 'Completed',
    },
    {
      offsetHours: 4,
      event: 'Ward round — clinical progress reviewed with care team',
      department: patient.department,
      author: patient.attendingDoctor,
      authorRole: 'Doctor',
      status: patient.status === 'critical' ? 'in_progress' : 'completed',
      statusLabel: patient.status === 'critical' ? 'In progress' : 'Completed',
    },
    ...patient.medications.map(
      (medication, index): EventSeed => ({
        offsetHours: 6 + index,
        event: `${medication.name} scheduled — ${medication.dosage} ${medication.frequency}`,
        department: patient.department,
        author: patient.assignedNurse,
        authorRole: 'Nurse',
        status: index === 0 ? 'completed' : 'pending',
        statusLabel: index === 0 ? 'Completed' : 'Pending',
      }),
    ),
  ]

  if (patient.status === 'critical') {
    seeds.splice(1, 0, {
      offsetHours: 1,
      event: 'Escalated to intensive monitoring per rapid response review',
      department: 'Intensive Care',
      author: patient.attendingDoctor,
      authorRole: 'Doctor',
      status: 'completed',
      statusLabel: 'Completed',
    })
  }

  if (patient.status === 'discharged') {
    seeds.push({
      offsetHours: 12,
      event: 'Discharged with care plan and follow-up instructions',
      department: patient.department,
      author: patient.attendingDoctor,
      authorRole: 'Doctor',
      status: 'completed',
      statusLabel: 'Completed',
    })
  }

  return seeds.map((seed, index) => ({
    id: `EV-${patient.patientId}-${index}`,
    patientId: patient.patientId,
    timestamp: addHours(patient.admissionDate, seed.offsetHours),
    event: seed.event,
    department: seed.department,
    author: seed.author,
    authorRole: seed.authorRole,
    status: seed.status,
    statusLabel: seed.statusLabel,
  }))
}