import type {
  FamilyBillingSummary,
  FamilyNotification,
  FamilyPatientLink,
  UpcomingCareEvent,
} from '@/types/family'

/**
 * Fictional family portal data for the demo family account. All names,
 * amounts and schedules are invented for interface demonstration only — no
 * real hospital invoices or records exist in this repository.
 */

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000

const isoFromNow = (ms: number): string => new Date(Date.now() + ms).toISOString()
const alignNextMorning = (): string => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(9, 0, 0, 0)
  return date.toISOString()
}

export const FAMILY_LINKS: FamilyPatientLink[] = [
  {
    patientId: 'P-2026-1054',
    patientName: 'Farzana Yasmin',
    relationship: 'Son',
    accessGrantedAt: isoFromNow(-12 * DAY_MS),
  },
]

export const BILLING_BY_PATIENT: Record<string, FamilyBillingSummary> = {
  'P-2026-1054': {
    totalCharged: 34_300,
    paidAmount: 10_000,
    outstandingAmount: 24_300,
    currency: 'BDT',
    lastInvoiceAt: isoFromNow(-8 * HOUR_MS),
    items: [
      { label: 'Bed & nursing — Cardiology (4 days)', amount: 18_000 },
      { label: 'Cardiac monitoring package', amount: 6_000 },
      { label: 'Cardiology consultation', amount: 5_000 },
      { label: 'Investigations (troponin, electrolytes)', amount: 3_200 },
      { label: 'ECG × 2', amount: 1_500 },
      { label: 'Medications (Atorvastatin, Clopidogrel)', amount: 600 },
    ],
  },
}

export const UPCOMING_BY_PATIENT: Record<string, UpcomingCareEvent[]> = {
  'P-2026-1054': [
    {
      id: 'UC-0001',
      title: 'Cardiology ward round — progress review',
      scheduledAt: isoFromNow(5 * HOUR_MS),
      department: 'Cardiology',
      kind: 'review',
    },
    {
      id: 'UC-0002',
      title: 'Coronary angiography consultation',
      scheduledAt: alignNextMorning(),
      department: 'Cardiology',
      kind: 'consultation',
    },
    {
      id: 'UC-0003',
      title: 'Echocardiogram',
      scheduledAt: isoFromNow(2 * DAY_MS + 11 * HOUR_MS),
      department: 'Cardiology',
      kind: 'investigation',
    },
    {
      id: 'UC-0004',
      title: 'Post-discharge follow-up visit',
      scheduledAt: isoFromNow(14 * DAY_MS),
      department: 'Cardiology',
      kind: 'follow_up',
    },
  ],
}

export const NOTIFICATIONS_BY_PATIENT: Record<string, FamilyNotification[]> = {
  'P-2026-1054': [
    {
      id: 'FN-0001',
      title: 'Daily charges updated',
      message:
        'The day statement for the current admission has been updated. Outstanding balance is BDT 24,300.',
      createdAt: isoFromNow(-8 * HOUR_MS),
      importance: 'warning',
      read: false,
    },
    {
      id: 'FN-0002',
      title: 'Morning vitals recorded',
      message:
        'The nursing team recorded stable observations this morning and the cardiologist was informed.',
      createdAt: isoFromNow(-5 * HOUR_MS),
      importance: 'info',
      read: true,
    },
    {
      id: 'FN-0003',
      title: 'Rehabilitation plan started',
      message:
        'The post-MI rehabilitation plan has begun. Supervised activity is scheduled with the physiotherapy team.',
      createdAt: isoFromNow(-26 * HOUR_MS),
      importance: 'info',
      read: true,
    },
    {
      id: 'FN-0004',
      title: 'Visiting hours reminder',
      message: 'Family visits are allowed daily between 10:00 and 20:00 at the Cardiology ward.',
      createdAt: isoFromNow(-30 * HOUR_MS),
      importance: 'info',
      read: true,
    },
  ],
}

/** Zeroed fallback so a patient without billing data never shows nothing. */
export const EMPTY_BILLING: FamilyBillingSummary = {
  totalCharged: 0,
  paidAmount: 0,
  outstandingAmount: 0,
  currency: 'BDT',
  lastInvoiceAt: new Date().toISOString(),
  items: [],
}