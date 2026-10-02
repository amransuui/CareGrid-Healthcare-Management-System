import type { NotificationItem } from '@/types/notifications'
import type { UserRole } from '@/types/auth'

/**
 * Fictional notification feed for the demo notification centre. Timestamps are
 * generated relative to page load so relative times ("5m ago") stay realistic.
 * Every entry is invented; no push, SMS or email service is involved, and the
 * `audience` field only controls what a signed-in demo role can see.
 */

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString()

const STAFF: UserRole[] = [
  'doctor',
  'nurse',
  'blood_bank_coordinator',
  'pharmacist',
  'billing_officer',
]

const CLINICAL: UserRole[] = ['doctor', 'nurse']
const FAMILY: UserRole[] = ['patient_family']

export const notificationsData: NotificationItem[] = [
  {
    id: 'ntf-001',
    module: 'clinical',
    type: 'Escalation',
    title: 'Critical patient flagged in ICU',
    description:
      'Mohammad Rahman (P-2026-1042) was flagged critical during the last observations round. Review the vitals trend.',
    time: minutesAgo(9),
    priority: 'critical',
    href: '/app/patients/P-2026-1042',
    audience: CLINICAL,
  },
  {
    id: 'ntf-002',
    module: 'clinical',
    type: 'Vitals',
    title: 'Oxygen saturation below threshold',
    description:
      'Elias Hossain recorded SpO2 at 90% across two consecutive readings. Escalation pathway applies.',
    time: minutesAgo(21),
    priority: 'high',
    href: '/app/vitals/P-2026-1048',
    audience: CLINICAL,
  },
  {
    id: 'ntf-003',
    module: 'clinical',
    type: 'Observation',
    title: 'Vitals round due for Ward 2',
    description:
      'Four inpatients in the Neurology ward are due an observations round within the next hour.',
    time: minutesAgo(46),
    priority: 'normal',
    href: '/app/vitals',
    audience: ['nurse'],
  },
  {
    id: 'ntf-004',
    module: 'clinical',
    type: 'Update',
    title: 'Consultation note added for Kabir Chowdhury',
    description:
      'Dr. Nazma Sultana added a consultation note to the admission record for the cardiology team to review.',
    time: minutesAgo(95),
    priority: 'low',
    href: '/app/patients/P-2026-1051',
    audience: CLINICAL,
  },
  {
    id: 'ntf-005',
    module: 'operations',
    type: 'Bed status',
    title: 'Bed assigned in ICU',
    description: 'ICU bed 105 has been released and reassigned for a planned transfer.',
    time: minutesAgo(33),
    priority: 'normal',
    href: '/app/wards',
    audience: STAFF,
  },
  {
    id: 'ntf-006',
    module: 'operations',
    type: 'Housekeeping',
    title: 'Three beds awaiting terminal cleaning',
    description:
      'Beds EMG-102, GEN-103 and NEU-104 are marked for cleaning and will not appear as available until cleared.',
    time: minutesAgo(72),
    priority: 'normal',
    href: '/app/wards',
    audience: ['nurse'],
  },
  {
    id: 'ntf-007',
    module: 'operations',
    type: 'Admission',
    title: 'Planned admission scheduled for tomorrow',
    description:
      'Jannatul Ferdous is listed for an elective cardiology admission with a bed provisionally held.',
    time: minutesAgo(180),
    priority: 'normal',
    href: '/app/wards',
    audience: STAFF,
  },
  {
    id: 'ntf-008',
    module: 'pharmacy',
    type: 'Prescription',
    title: 'Prescription approved and forwarded',
    description:
      'RX-2026-1181 was approved by the prescriber and queued for the pharmacy team to prepare.',
    time: minutesAgo(58),
    priority: 'normal',
    href: '/app/pharmacy/prescriptions',
    audience: ['doctor', 'nurse', 'pharmacist'],
  },
  {
    id: 'ntf-009',
    module: 'pharmacy',
    type: 'Safety',
    title: 'Allergy warning raised on a new prescription',
    description:
      'A penicillin allergy flag was raised against Amoxiclav for an inpatient. A pharmacist review is required before dispensing.',
    time: minutesAgo(64),
    priority: 'critical',
    href: '/app/pharmacy/alerts',
    audience: ['pharmacist', 'doctor'],
  },
  {
    id: 'ntf-010',
    module: 'pharmacy',
    type: 'Stock',
    title: 'Two items reached the reorder level',
    description:
      'Amloc and Montair are at or below their reorder levels. Purchase requisitions are simulated in the demo module.',
    time: minutesAgo(140),
    priority: 'high',
    href: '/app/pharmacy/inventory',
    audience: ['pharmacist'],
  },
  {
    id: 'ntf-011',
    module: 'pharmacy',
    type: 'Expiry',
    title: 'Batch approaching expiry within 30 days',
    description:
      'Azipod and Pred batches fall inside the 30-day expiry window. Review rotation before the next dispensing cycle.',
    time: minutesAgo(260),
    priority: 'high',
    href: '/app/pharmacy/inventory',
    audience: ['pharmacist'],
  },
  {
    id: 'ntf-012',
    module: 'blood',
    type: 'Stock warning',
    title: 'O negative stock below threshold',
    description:
      'O− units on hand have dropped to 12 with several batches near expiry. Review the inventory plan.',
    time: minutesAgo(32),
    priority: 'critical',
    href: '/app/blood/inventory',
    audience: ['blood_bank_coordinator', 'doctor', 'nurse'],
  },
  {
    id: 'ntf-013',
    module: 'blood',
    type: 'Emergency',
    title: 'Emergency SOS raised for the emergency department',
    description:
      'A mass-casualty support request was raised by the emergency team. Respond in the blood bank workspace.',
    time: minutesAgo(15),
    priority: 'critical',
    href: '/app/blood/sos',
    audience: ['blood_bank_coordinator'],
  },
  {
    id: 'ntf-014',
    module: 'blood',
    type: 'Donor',
    title: 'Donor eligibility window closing',
    description:
      'Three registered donors reach the end of their deferral period this week and can be reactivated.',
    time: minutesAgo(300),
    priority: 'normal',
    href: '/app/blood/donors',
    audience: ['blood_bank_coordinator'],
  },
  {
    id: 'ntf-015',
    module: 'blood',
    type: 'Request',
    title: 'Two cross-match requests awaiting collection',
    description:
      'Requests for AB+ and B+ units are confirmed and waiting on donor collection slots.',
    time: minutesAgo(120),
    priority: 'high',
    href: '/app/blood/requests',
    audience: ['blood_bank_coordinator', 'nurse'],
  },
  {
    id: 'ntf-016',
    module: 'organ',
    type: 'Match',
    title: 'New compatible kidney match identified',
    description:
      'A compatibility score of 86 was recorded for a candidate pair. Review cross-match requirements before proceeding.',
    time: minutesAgo(185),
    priority: 'high',
    href: '/app/organ/matching',
    audience: ['doctor', 'nurse'],
  },
  {
    id: 'ntf-017',
    module: 'organ',
    type: 'Ischemia',
    title: 'Cold ischaemia window entering the caution band',
    description:
      'A retrieved organ is approaching the caution threshold on the ischemia board. Confirm the transport plan.',
    time: minutesAgo(42),
    priority: 'critical',
    href: '/app/organ/ischemia',
    audience: ['doctor', 'nurse'],
  },
  {
    id: 'ntf-018',
    module: 'organ',
    type: 'Donor',
    title: 'Living donor follow-up due',
    description:
      'A post-donation follow-up review is scheduled; the counselling team has been assigned.',
    time: minutesAgo(420),
    priority: 'normal',
    href: '/app/organ/living-donors',
    audience: ['doctor', 'nurse'],
  },
  {
    id: 'ntf-019',
    module: 'billing',
    type: 'Claim',
    title: 'Insurance claim moved to under review',
    description:
      'CLM-2026-0416 is now with the insurer for review. The insurer requested the angiography cost sheet.',
    time: minutesAgo(35),
    priority: 'normal',
    href: '/app/billing/claims',
    audience: ['billing_officer'],
  },
  {
    id: 'ntf-020',
    module: 'billing',
    type: 'Claim',
    title: 'Claim rejected — patient notification required',
    description:
      'CLM-2026-0413 was rejected under the pre-existing condition clause. The family advisory desk has been notified.',
    time: minutesAgo(70),
    priority: 'high',
    href: '/app/billing/claims',
    audience: ['billing_officer', 'nurse'],
  },
  {
    id: 'ntf-021',
    module: 'billing',
    type: 'Outstanding',
    title: 'Outstanding balance blocking a discharge',
    description:
      'An elective ophthalmology admission is on billing hold with a self-pay amount still outstanding.',
    time: minutesAgo(110),
    priority: 'high',
    href: '/app/discharge/P-2026-1082',
    audience: ['billing_officer'],
  },
  {
    id: 'ntf-022',
    module: 'billing',
    type: 'Invoice',
    title: 'New invoice raised against an active admission',
    description:
      'INV-2026-0412 was generated for the current ICU admission and is awaiting an initial payment.',
    time: minutesAgo(155),
    priority: 'normal',
    href: '/app/billing/invoices',
    audience: ['billing_officer'],
  },
  {
    id: 'ntf-023',
    module: 'system',
    type: 'Maintenance',
    title: 'Planned maintenance window this weekend',
    description:
      'A simulated maintenance window is scheduled. Demo data is generated locally and is unaffected.',
    time: minutesAgo(240),
    priority: 'low',
    audience: STAFF,
  },
  {
    id: 'ntf-024',
    module: 'system',
    type: 'Access',
    title: 'New device signed in to the demo workspace',
    description:
      'A sign-in from an unrecognised browser was recorded for the demo session. Revoke other sessions from settings.',
    time: minutesAgo(200),
    priority: 'normal',
    href: '/app/settings',
    audience: STAFF,
  },
  {
    id: 'ntf-025',
    module: 'clinical',
    type: 'Family update',
    title: 'Discharge summary is ready to review',
    description:
      'The discharge summary for Abul Kalam Azad has been drafted and is waiting for the ward team to review it with the family.',
    time: minutesAgo(55),
    priority: 'normal',
    href: '/app/discharge/P-2026-1046',
    audience: FAMILY,
  },
  {
    id: 'ntf-026',
    module: 'billing',
    type: 'Family update',
    title: 'Invoice ready for your records',
    description:
      'The invoice for the current admission has been prepared. The amounts shown are illustrative in this demo.',
    time: minutesAgo(190),
    priority: 'low',
    href: '/app/family',
    audience: FAMILY,
  },
  {
    id: 'ntf-027',
    module: 'clinical',
    type: 'Family update',
    title: 'Follow-up appointment booked',
    description:
      'A physiotherapy follow-up has been arranged. Please bring the discharge instructions and medication list.',
    time: minutesAgo(330),
    priority: 'normal',
    href: '/app/family',
    audience: FAMILY,
  },
  {
    id: 'ntf-028',
    module: 'system',
    type: 'Family update',
    title: 'Record access is limited to this admission',
    description:
      'Family access covers the linked patient only. Other admissions and staff modules stay hidden.',
    time: minutesAgo(600),
    priority: 'low',
    href: '/app/settings',
    audience: FAMILY,
  },
]
