import type { ActivityEvent } from '@/types/dashboard'

/**
 * Fictional recent-activity feed for the dashboard. Relative timestamps are
 * generated at load so the demo stays internally consistent.
 */
const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString()

export const recentActivityData: ActivityEvent[] = [
  {
    id: 'act-01',
    time: minutesAgo(12),
    event: 'Patient admitted to ICU',
    department: 'Ward 3 · ICU',
    user: 'Ayesha Malik',
    roleLabel: 'Nurse',
    status: 'done',
    statusLabel: 'Completed',
  },
  {
    id: 'act-02',
    time: minutesAgo(54),
    event: 'Blood request created',
    department: 'Blood Bank',
    user: 'Fatima Noor',
    roleLabel: 'Blood Bank Coordinator',
    status: 'in_progress',
    statusLabel: 'In progress',
  },
  {
    id: 'act-03',
    time: minutesAgo(97),
    event: 'Prescription approved',
    department: 'Pharmacy',
    user: 'Dr. Shahid Hasan',
    roleLabel: 'Doctor',
    status: 'done',
    statusLabel: 'Completed',
  },
  {
    id: 'act-04',
    time: minutesAgo(150),
    event: 'Bed assigned · Ward 5',
    department: 'Operations',
    user: 'S. Mahmud',
    roleLabel: 'Ward Clerk',
    status: 'done',
    statusLabel: 'Completed',
  },
  {
    id: 'act-05',
    time: minutesAgo(210),
    event: 'Billing claim submitted',
    department: 'Billing',
    user: 'Rana Khan',
    roleLabel: 'Billing Officer',
    status: 'pending',
    statusLabel: 'Pending',
  },
  {
    id: 'act-06',
    time: minutesAgo(315),
    event: 'Organ match accepted',
    department: 'Organ Coordination',
    user: 'Dr. Nazma Sultana',
    roleLabel: 'Transplant Surgeon',
    status: 'done',
    statusLabel: 'Completed',
  },
]