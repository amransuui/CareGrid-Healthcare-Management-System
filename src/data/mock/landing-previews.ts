import type { StatusTone } from '@/components/common/status-badge'

/**
 * Fictional preview data used only to render marketing product previews on
 * the public landing page. Real feature data flows through the service layer
 * and is added module by module in later phases.
 */

export const heroKpis = [
  { label: 'Active patients', value: '428', trend: '+12 today' },
  { label: 'Ward occupancy', value: '76%', trend: '214 of 282 beds' },
  { label: 'Blood units in stock', value: '212', trend: '3 groups critical' },
  { label: 'Prescription queue', value: '14', trend: '4 marked priority' },
] as const

export const flowTrend = [
  { day: 'Mon', admitted: 34, discharged: 22 },
  { day: 'Tue', admitted: 41, discharged: 28 },
  { day: 'Wed', admitted: 38, discharged: 31 },
  { day: 'Thu', admitted: 45, discharged: 33 },
  { day: 'Fri', admitted: 42, discharged: 36 },
  { day: 'Sat', admitted: 36, discharged: 29 },
  { day: 'Sun', admitted: 39, discharged: 27 },
] as const

export const wardOccupancy = [
  { ward: 'ICU', occupied: 28, total: 30 },
  { ward: 'Cardio', occupied: 52, total: 64 },
  { ward: 'Surgical', occupied: 61, total: 86 },
  { ward: 'General', occupied: 47, total: 72 },
  { ward: 'Maternity', occupied: 26, total: 44 },
] as const

export interface LandingAlert {
  tone: StatusTone
  title: string
  detail: string
}

export const criticalAlerts: LandingAlert[] = [
  {
    tone: 'critical',
    title: 'O− platelets below threshold',
    detail: 'Blood bank · Peripheral ward',
  },
  {
    tone: 'warning',
    title: '2 donor matches require review',
    detail: 'Organ care · Transplant team',
  },
  {
    tone: 'warning',
    title: 'Metformin 500 mg stock low',
    detail: 'Pharmacy · East wing',
  },
  {
    tone: 'info',
    title: 'SOS broadcast matched 4 donors',
    detail: 'Blood bank · 12 min ago',
  },
]

export const recentActivity = [
  { user: 'Dr. S. Hassan', action: 'signed prescription RX-4821', time: '4 min ago' },
  { user: 'Nurse A. Malik', action: 'updated vitals on Ward B4', time: '9 min ago' },
  { user: 'Billing office', action: 'submitted insurance claim CL-2104', time: '18 min ago' },
  { user: 'Laboratory', action: 'released crossmatch result', time: '26 min ago' },
] as const

export const valuePoints = [
  {
    title: 'Unified Healthcare Operations',
    description: 'Patients, blood, organs and pharmacy workloads on one platform.',
  },
  {
    title: 'Role-Based Workflows',
    description: 'Every care team sees the information relevant to their work.',
  },
  {
    title: 'Real-Time Operational Visibility',
    description: 'Live status across wards, inventory and clinical queues.',
  },
  {
    title: 'Secure Data Access',
    description: 'Access scoped to roles, with activity recorded for review.',
  },
] as const

export const problemFragments = [
  {
    title: 'Fragmented information',
    description: 'Patient data, blood stock and orders live in separate places.',
  },
  {
    title: 'Delayed emergency coordination',
    description: 'Critical requests depend on calls and hand-written notes.',
  },
  {
    title: 'Unclear patient & family visibility',
    description: 'Families wait for updates that rarely travel in real time.',
  },
  {
    title: 'Manual workflows',
    description: 'Prescriptions, claims and discharge run on paper or forms.',
  },
  {
    title: 'Disconnected departments',
    description: 'Wards, lab, pharmacy and billing each keep their own version.',
  },
  {
    title: 'Inventory uncertainty',
    description: 'Blood and medicine availability changes faster than it is shared.',
  },
] as const

export const connectedFlow = [
  { label: 'Patients', description: 'One shared clinical record' },
  { label: 'Clinical Care', description: 'Wards, beds and vitals' },
  { label: 'Blood Bank', description: 'Inventory, donors and SOS' },
  { label: 'Organ Care', description: 'Matching and waiting list' },
  { label: 'Pharmacy', description: 'Prescriptions and safety' },
  { label: 'Billing & Discharge', description: 'Invoices, claims and summary' },
] as const

export const organMatchPreview = [
  {
    recipient: 'M. Rahman',
    organ: 'Kidney',
    blood: 'A+',
    hla: '3/6',
    urgency: 'High',
    distance: '28 km',
    score: 91,
    compatibility: 'Compatible',
    tone: 'success' as StatusTone,
  },
  {
    recipient: 'S. Khan',
    organ: 'Liver',
    blood: 'O+',
    hla: '2/6',
    urgency: 'Critical',
    distance: '112 km',
    score: 84,
    compatibility: 'Compatible',
    tone: 'success' as StatusTone,
  },
  {
    recipient: 'J. Ansari',
    organ: 'Heart',
    blood: 'B+',
    hla: '1/6',
    urgency: 'Urgent',
    distance: '47 km',
    score: 76,
    compatibility: 'For review',
    tone: 'warning' as StatusTone,
  },
  {
    recipient: 'F. Begum',
    organ: 'Kidney',
    blood: 'AB+',
    hla: '4/6',
    urgency: 'Std.',
    distance: '61 km',
    score: 94,
    compatibility: 'Compatible',
    tone: 'success' as StatusTone,
  },
] as const

export const waitingListSummary = [
  { label: 'Active on list', value: '42' },
  { label: 'Critical priority', value: '6' },
  { label: 'Awaiting review', value: '11' },
] as const

export const ischemiaTimer = {
  label: 'Cold ischemia time',
  value: '4h 18m',
  remaining: '~6h 42m remaining',
  limit: '12h limit',
} as const

export const bloodSummary = [
  { label: 'Total units', value: '318' },
  { label: 'Critical groups', value: '3' },
  { label: 'Expiring ≤ 72h', value: '14' },
  { label: 'Active requests', value: '7' },
  { label: 'Emergency SOS', value: '1' },
] as const

export const bloodInventory = [
  { group: 'O+', whole: 22, rbc: 28, platelets: 14, plasma: 19, critical: false, expiring: 3 },
  { group: 'O−', whole: 6, rbc: 9, platelets: 3, plasma: 7, critical: true, expiring: 5 },
  { group: 'A+', whole: 25, rbc: 31, platelets: 18, plasma: 21, critical: false, expiring: 2 },
  { group: 'A−', whole: 5, rbc: 8, platelets: 4, plasma: 6, critical: true, expiring: 4 },
  { group: 'B+', whole: 18, rbc: 22, platelets: 11, plasma: 15, critical: false, expiring: 1 },
  { group: 'B−', whole: 4, rbc: 5, platelets: 2, plasma: 4, critical: false, expiring: 0 },
  { group: 'AB+', whole: 11, rbc: 14, platelets: 6, plasma: 9, critical: false, expiring: 2 },
  { group: 'AB−', whole: 3, rbc: 4, platelets: 2, plasma: 3, critical: true, expiring: 1 },
] as const

export const bloodComponents = ['Whole Blood', 'RBC', 'Platelets', 'Plasma'] as const

export const sosWorkflow = [
  {
    step: 'Detect',
    description: 'A request is created with blood group, component and urgency.',
  },
  {
    step: 'Filter',
    description: 'Compatible donors and nearby inventory are shortlisted.',
  },
  {
    step: 'Locate',
    description: 'Matching units are located across the network.',
  },
  {
    step: 'Broadcast',
    description: 'A facility-wide broadcast shows clear next actions.',
  },
] as const

export const patientPreview = {
  mrn: 'MRN-004281',
  name: 'Ayesha Rahman',
  age: 46,
  admitted: 'Sep 12 · 09:40',
  condition: 'Post-op nephrectomy — stable',
  ward: 'Surgical · North Wing',
  bed: 'Bed 07',
  doctor: 'Dr. S. Hasan',
  vitals: [
    { label: 'Heart rate', value: '72 bpm' },
    { label: 'Blood pressure', value: '118 / 76 mmHg' },
    { label: 'Temperature', value: '36.8 °C' },
    { label: 'SpO₂', value: '98%' },
  ] as const,
  medications: [
    { name: 'Paracetamol 500 mg', schedule: '4× daily' },
    { name: 'Cefuroxime 500 mg', schedule: '2× daily' },
  ] as const,
  timeline: [
    { time: '09:40', event: 'Admitted · Surgical North Wing' },
    { time: '11:15', event: 'Pre-op checklist completed' },
    { time: '13:30', event: 'Surgery completed — stable recovery' },
    { time: '15:05', event: 'Vitals reviewed, medications started' },
  ] as const,
  alerts: [
    { tone: 'info' as StatusTone, text: 'Discharge planning scheduled for Day 3' },
    { tone: 'neutral' as StatusTone, text: 'Family holds read-only access' },
  ] as const,
}

export const prescriptionLines = [
  { medicine: 'Amoxicillin 500 mg', dosage: '1 capsule', frequency: '3× daily', duration: '7 days', note: 'Take after food' },
  { medicine: 'Paracetamol 500 mg', dosage: '1 tablet', frequency: 'Every 6 h', duration: '5 days', note: 'As needed for fever' },
  { medicine: 'Omeprazole 20 mg', dosage: '1 capsule', frequency: 'Once daily', duration: '14 days', note: 'Before breakfast' },
] as const

export const prescriptionWarnings = [
  { tone: 'critical' as StatusTone, title: 'Allergy alert', detail: 'Patient has a documented Penicillin allergy.' },
  { tone: 'warning' as StatusTone, title: 'Drug interaction', detail: 'Potential interaction between Metformin and Lisinopril.' },
  { tone: 'warning' as StatusTone, title: 'Duplicate medication', detail: 'Amoxicillin is already active on RX-4790.' },
] as const

export const prescriptionSteps = [
  { label: 'Patient' },
  { label: 'Medication' },
  { label: 'Safety check' },
  { label: 'Preview' },
  { label: 'Pharmacy' },
] as const

export const billingLines = [
  { label: 'Consultation', category: 'Consultation', amount: '1,200' },
  { label: 'Room — semi-private (4 nights)', category: 'Room', amount: '4,800' },
  { label: 'Pharmacy — medications', category: 'Pharmacy', amount: '2,140' },
  { label: 'Laboratory — panels', category: 'Laboratory', amount: '1,650' },
  { label: 'Surgical supplies', category: 'Other', amount: '3,900' },
] as const

export const billingSummary = {
  subtotal: '13,690',
  insurance: '8,214',
  final: '5,476',
  insuranceProvider: 'CarePlus Health',
  claimStatus: 'Approved',
  claimTone: 'success' as StatusTone,
} as const

export const dischargePreview = {
  title: 'Digital discharge summary',
  patient: 'Ayesha Rahman · MRN-004281',
  diagnosis: 'Left nephrectomy (living donor kidney) — post-operative care',
  medications: 'Continue Cefuroxime 500 mg twice daily for 5 days',
  followUp: 'Follow-up with Nephrology OPD in 7 days',
  signedBy: 'Dr. S. Hasan · Surgical Lead',
} as const

export const howItWorks = [
  {
    step: '01',
    title: 'Connect',
    description: 'Patients and care teams come together on one operational platform.',
  },
  {
    step: '02',
    title: 'Coordinate',
    description: 'Blood, organs, prescriptions and beds move through shared flows.',
  },
  {
    step: '03',
    title: 'Monitor',
    description: 'Live status across wards, inventory and clinical queues.',
  },
  {
    step: '04',
    title: 'Act',
    description: 'Clear alerts and focused tasks keep the right team moving.',
  },
] as const

export const roles = [
  { title: 'Doctor', description: 'Patients, vitals, orders and organ matching context.' },
  { title: 'Nurse', description: 'Wards, beds, vitals and patient updates.' },
  { title: 'Blood Bank Coordinator', description: 'Inventory, donors, requests and emergency SOS.' },
  { title: 'Pharmacist', description: 'Prescription queue, stock and safety alerts.' },
  { title: 'Billing Officer', description: 'Invoices, insurance claims and discharge.' },
  { title: 'Patient / Family', description: 'Status, medications, updates and discharge.' },
] as const

export const benefits = [
  {
    audience: 'Care teams',
    description: 'Focused, connected workflows from admission to discharge.',
    points: ['Better workflow visibility', 'Faster coordination', 'Reduced fragmentation'],
  },
  {
    audience: 'Operations',
    description: 'A real-time view of the state of every critical workflow.',
    points: ['Centralized monitoring', 'Inventory awareness', 'Clear operational status'],
  },
  {
    audience: 'Patients & families',
    description: 'Clear, timely information through every stage of care.',
    points: ['Better visibility', 'Clearer information', 'Connected care experience'],
  },
] as const

export const moduleCapabilities = {
  organ: ['Compatibility scoring', 'HLA context', 'Waiting list', 'Ischemia timers'],
  blood: ['Group & component stock', 'Expiry tracking', 'Donor registry', 'Emergency SOS flow'],
  patient: ['Profile & vitals', 'Care timeline', 'Medications', 'Family visibility'],
  prescription: ['Patient & diagnosis', 'Medication list', 'Safety checks', 'Pharmacy handoff'],
  billing: ['Itemized invoices', 'Insurance claims', 'Cost breakdown', 'Digital discharge'],
} as const