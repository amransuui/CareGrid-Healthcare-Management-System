import type {
  DashboardAlert,
  DashboardKpi,
  DashboardOverview,
  RoleDashboardFocus,
  QuickAction,
  PrescriptionTask,
  OrganMatchTask,
  PatientFlowDay,
  WardStat,
  BloodGroupStock,
} from '@/types/dashboard'

/**
 * Fictional dashboard data for the frontend demo. Every number here is
 * illustrative, generated for a university lab preview, and is clearly
 * labeled as demo data in the UI. Real values will come from the Future
 * Spring Boot backend via the dashboard service.
 */

export const dashboardKpis: DashboardKpi[] = [
  {
    id: 'totalPatients',
    label: 'Total Patients',
    value: '214',
    context: 'Active inpatients',
    delta: '+8 this week',
  },
  {
    id: 'criticalPatients',
    label: 'Critical Patients',
    value: '12',
    context: 'Require urgent attention',
    delta: '−2 in 24h',
  },
  {
    id: 'wardOccupancy',
    label: 'Ward Occupancy',
    value: '76%',
    context: '214 of 282 beds in use',
    delta: '+3% today',
  },
  {
    id: 'bloodInventory',
    label: 'Blood Inventory',
    value: '318',
    context: 'Units across 8 groups',
    delta: '3 groups critical',
  },
  {
    id: 'organMatches',
    label: 'Active Organ Matches',
    value: '12',
    context: 'Reviewed this week',
    delta: '+3 new',
  },
  {
    id: 'prescriptionQueue',
    label: 'Prescription Queue',
    value: '14',
    context: 'Awaiting pharmacist',
    delta: '5 priority',
  },
  {
    id: 'pendingBilling',
    label: 'Pending Billing',
    value: '23',
    context: 'Claims in review',
    delta: '8 w/ insurance',
  },
  {
    id: 'emergencyRequests',
    label: 'Emergency Requests',
    value: '1',
    context: 'Open blood SOS · O− needed',
    delta: '4 donors matched',
  },
]

export const patientFlowData: PatientFlowDay[] = [
  { day: 'Mon', admitted: 18, discharged: 14 },
  { day: 'Tue', admitted: 21, discharged: 12 },
  { day: 'Wed', admitted: 15, discharged: 19 },
  { day: 'Thu', admitted: 24, discharged: 16 },
  { day: 'Fri', admitted: 17, discharged: 13 },
  { day: 'Sat', admitted: 12, discharged: 15 },
  { day: 'Sun', admitted: 20, discharged: 18 },
]

export const wardOccupancyData: WardStat[] = [
  { ward: 'ICU', occupied: 14, available: 1, cleaning: 1, reserved: 1 },
  { ward: 'Cardiology', occupied: 32, available: 4, cleaning: 2, reserved: 1 },
  { ward: 'Surgical', occupied: 41, available: 6, cleaning: 2, reserved: 2 },
  { ward: 'Pediatric', occupied: 28, available: 7, cleaning: 2, reserved: 1 },
  { ward: 'General', occupied: 72, available: 18, cleaning: 5, reserved: 3 },
  { ward: 'Maternity', occupied: 27, available: 8, cleaning: 2, reserved: 2 },
]

export const bloodInventoryData: BloodGroupStock[] = [
  { group: 'O+', units: 135, expiring: 10, status: 'ok' },
  { group: 'A+', units: 60, expiring: 6, status: 'ok' },
  { group: 'B+', units: 52, expiring: 4, status: 'ok' },
  { group: 'AB+', units: 22, expiring: 3, status: 'low' },
  { group: 'O−', units: 12, expiring: 5, status: 'critical' },
  { group: 'A−', units: 19, expiring: 4, status: 'low' },
  { group: 'B−', units: 11, expiring: 3, status: 'critical' },
  { group: 'AB−', units: 7, expiring: 2, status: 'critical' },
]

export const prescriptionQueueData: PrescriptionTask[] = [
  {
    id: 'RX-4213',
    patient: 'M. Rahman',
    medication: 'Warfarin 5 mg',
    priority: 'priority',
    status: 'awaiting_pharmacist',
    time: '08:41',
  },
  {
    id: 'RX-4212',
    patient: 'S. Akter',
    medication: 'Insulin glargine',
    priority: 'priority',
    status: 'safety_review',
    time: '08:22',
  },
  {
    id: 'RX-4211',
    patient: 'K. Ali',
    medication: 'Amoxicillin 500 mg',
    priority: 'standard',
    status: 'awaiting_pharmacist',
    time: '08:05',
  },
  {
    id: 'RX-4210',
    patient: 'N. Ferdous',
    medication: 'Atorvastatin 20 mg',
    priority: 'standard',
    status: 'ready',
    time: '07:48',
  },
  {
    id: 'RX-4209',
    patient: 'H. Uddin',
    medication: 'Salbutamol inhaler',
    priority: 'standard',
    status: 'awaiting_pharmacist',
    time: '07:31',
  },
]

export const organMatchData: OrganMatchTask[] = [
  {
    id: 'MATCH-218',
    recipient: 'R. Karim',
    organ: 'Kidney',
    blood: 'O+',
    score: 86,
    urgency: 'critical',
  },
  {
    id: 'MATCH-217',
    recipient: 'F. Sultana',
    organ: 'Liver',
    blood: 'A−',
    score: 79,
    urgency: 'urgent',
  },
  {
    id: 'MATCH-216',
    recipient: 'T. Mahmud',
    organ: 'Kidney',
    blood: 'B+',
    score: 72,
    urgency: 'urgent',
  },
  {
    id: 'MATCH-215',
    recipient: 'L. Parvin',
    organ: 'Heart',
    blood: 'AB+',
    score: 64,
    urgency: 'standard',
  },
]

export const dashboardAlerts: DashboardAlert[] = [
  {
    id: 'alrt-1',
    severity: 'critical',
    title: 'O− blood stock below threshold',
    detail: 'Only 12 units available; the target is 25. A donor drive is recommended within 48 hours.',
    venue: 'Blood Bank',
    time: '10 min ago',
  },
  {
    id: 'alrt-2',
    severity: 'critical',
    title: 'ICU bed availability low',
    detail: '1 of 17 ICU beds free. Two transfers are awaiting step-down beds.',
    venue: 'Ward 3 · ICU',
    time: '32 min ago',
  },
  {
    id: 'alrt-3',
    severity: 'warning',
    title: 'Prescription safety review required',
    detail: 'RX-4212 (insulin glargine) flagged for dose-range review by pharmacy.',
    venue: 'Pharmacy',
    time: '1 h ago',
  },
  {
    id: 'alrt-4',
    severity: 'warning',
    title: 'Organ match requires clinician review',
    detail: 'MATCH-218 scored 86 but has a borderline crossmatch awaiting nephrologist sign-off.',
    venue: 'Organ Coordination',
    time: '2 h ago',
  },
  {
    id: 'alrt-5',
    severity: 'info',
    title: 'Weekly bed census due',
    detail: 'The 15:00 census snapshot is pending for the capacity planning report.',
    venue: 'Operations',
    time: '3 h ago',
  },
]

/**
 * Role-driven emphasis for the demo dashboard. This adjusts what is
 * surfaced first for each fictional role. It is rendering only and is NOT
 * authorization — real RBAC ships with the Spring Boot backend.
 */
export const roleDashboardFocus: RoleDashboardFocus = {
  doctor: {
    greeting: 'Two critical patients need review before ward rounds begin.',
    kpiIds: ['criticalPatients', 'prescriptionQueue', 'organMatches', 'wardOccupancy'],
    focusPoints: [
      { title: 'Critical patients', description: '12 patients flagged — 2 on ICU awaiting rounds.' },
      { title: 'Prescriptions awaiting sign-off', description: '14 orders are sitting in the pharmacy queue.' },
      { title: 'Organ matches to review', description: 'MATCH-218 needs a nephrologist sign-off.' },
    ],
  },
  nurse: {
    greeting: 'Shift handover notes are ready for Ward 3 and Pediatric.',
    kpiIds: ['wardOccupancy', 'criticalPatients', 'totalPatients', 'prescriptionQueue'],
    focusPoints: [
      { title: 'Patient monitoring', description: '214 active inpatients across 6 wards.' },
      { title: 'Ward occupancy', description: 'ICU is down to 1 available bed — hold new admissions.' },
      { title: 'Tasks due', description: 'Late vitals rounds pending on Cardiology.' },
    ],
  },
  blood_bank_coordinator: {
    greeting: 'O− stock is critical and the open SOS request needs donor matching.',
    kpiIds: ['bloodInventory', 'emergencyRequests', 'organMatches', 'pendingBilling'],
    focusPoints: [
      { title: 'Blood inventory', description: '3 groups below safe threshold (O−, B−, AB−).' },
      { title: 'Emergency SOS open', description: 'SOS-104 requests O− units — 4 donors matched.' },
      { title: 'Expiring units', description: '24 units expire within the next 72 hours.' },
    ],
  },
  pharmacist: {
    greeting: '14 prescriptions await dispensing — 5 are marked priority.',
    kpiIds: ['prescriptionQueue', 'bloodInventory', 'criticalPatients', 'pendingBilling'],
    focusPoints: [
      { title: 'Prescription queue', description: '5 priority orders and 1 safety review (RX-4212).' },
      { title: 'Safety alerts', description: '1 open dose-range flag awaiting pharmacist review.' },
      { title: 'Pharmacy inventory', description: 'Low stock flagged for 6 critical medications.' },
    ],
  },
  billing_officer: {
    greeting: '23 claims are in review with 8 waiting on insurance follow-up.',
    kpiIds: ['pendingBilling', 'totalPatients', 'wardOccupancy', 'emergencyRequests'],
    focusPoints: [
      { title: 'Billing queue', description: '23 open claims; 8 delayed by insurance queries.' },
      { title: 'Discharge blocks', description: '3 discharges pending final billing approval.' },
      { title: 'Insurance follow-up', description: '6 claims need supporting documents.' },
    ],
  },
  patient_family: {
    greeting: 'Track your loved one’s care, vitals, medication and billing here.',
    kpiIds: ['totalPatients', 'wardOccupancy', 'bloodInventory', 'pendingBilling'],
    focusPoints: [
      { title: 'Patient status', description: 'Updates on the current admission and discharge plan.' },
      { title: 'Vitals & medication', description: 'Latest readings and prescribed medication from the care team.' },
      { title: 'Billing & discharge', description: 'Itemized charges and the discharge checklist.' },
    ],
  },
}

export const quickActions: QuickAction[] = [
  {
    id: 'addPatient',
    label: 'Add Patient',
    description: 'Register a new admission',
    href: '/app/patients',
    icon: 'user-plus',
  },
  {
    id: 'recordVitals',
    label: 'Record Vitals',
    description: 'Log BP, pulse and temperature',
    href: '/app/vitals',
    icon: 'activity',
  },
  {
    id: 'bloodRequest',
    label: 'Create Blood Request',
    description: 'Request a cross-matched unit',
    href: '/app/blood/requests',
    icon: 'arrow-right-left',
  },
  {
    id: 'emergencySos',
    label: 'Emergency SOS',
    description: 'Send an urgent blood request',
    href: '/app/blood/sos',
    icon: 'siren',
  },
  {
    id: 'newPrescription',
    label: 'New Prescription',
    description: 'Order a medication',
    href: '/app/pharmacy/prescriptions',
    icon: 'clipboard-plus',
  },
  {
    id: 'createInvoice',
    label: 'Create Invoice',
    description: 'Generate a bill for a patient',
    href: '/app/billing',
    icon: 'receipt',
  },
]

export const dashboardOverview: DashboardOverview = {
  kpis: dashboardKpis,
  patientFlow: patientFlowData,
  wardOccupancy: wardOccupancyData,
  bloodInventory: bloodInventoryData,
  prescriptionQueue: prescriptionQueueData,
  organMatches: organMatchData,
  alerts: dashboardAlerts,
}