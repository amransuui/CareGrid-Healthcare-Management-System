import type { PharmacyMedicine, Prescription, SafetyAlert } from '@/types/pharmacy'

/**
 * Fictional pharmacy demo data: medicine catalog, prescriptions and safety
 * alerts. All patient names, drug brands and stock levels are invented for
 * interface demonstration. Alerts explicitly simulate possible safety
 * issues and are not actual medical decisions.
 */

const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * HOUR_MS).toISOString()
const daysAgo = (days: number): string =>
  new Date(Date.now() - days * DAY_MS).toISOString()
const daysFromNow = (days: number): string =>
  new Date(Date.now() + days * DAY_MS).toISOString()

export const PHARMACY_CATEGORIES = [
  'Painkiller',
  'Antibiotic',
  'Cardiovascular',
  'Antidiabetic',
  'Gastrointestinal',
  'Respiratory',
  'Anticoagulant',
  'Corticosteroid',
  'Antihistamine',
]

export const PHARMACY_MEDICINES: PharmacyMedicine[] = [
  { medicineId: 'MED-001', name: 'Napa', genericName: 'Paracetamol', strength: '500 mg', category: 'Painkiller', stock: 120, reorderLevel: 40, expiryDate: daysFromNow(220) },
  { medicineId: 'MED-002', name: 'Ceporex', genericName: 'Cefalexin', strength: '500 mg', category: 'Antibiotic', stock: 64, reorderLevel: 30, expiryDate: daysFromNow(160) },
  { medicineId: 'MED-003', name: 'Angilock', genericName: 'Metoprolol', strength: '50 mg', category: 'Cardiovascular', stock: 44, reorderLevel: 25, expiryDate: daysFromNow(210) },
  { medicineId: 'MED-004', name: 'Amloc', genericName: 'Amlodipine', strength: '5 mg', category: 'Cardiovascular', stock: 7, reorderLevel: 20, expiryDate: daysFromNow(95) },
  { medicineId: 'MED-005', name: 'Orbin', genericName: 'Metformin', strength: '500 mg', category: 'Antidiabetic', stock: 90, reorderLevel: 30, expiryDate: daysFromNow(300) },
  { medicineId: 'MED-006', name: 'Glimbi', genericName: 'Gliclazide', strength: '30 mg', category: 'Antidiabetic', stock: 18, reorderLevel: 25, expiryDate: daysFromNow(180) },
  { medicineId: 'MED-007', name: 'Maxpro', genericName: 'Omeprazole', strength: '20 mg', category: 'Gastrointestinal', stock: 58, reorderLevel: 25, expiryDate: daysFromNow(140) },
  { medicineId: 'MED-008', name: 'Montair', genericName: 'Montelukast', strength: '10 mg', category: 'Respiratory', stock: 12, reorderLevel: 20, expiryDate: daysFromNow(75) },
  { medicineId: 'MED-009', name: 'Azipod', genericName: 'Azithromycin', strength: '500 mg', category: 'Antibiotic', stock: 6, reorderLevel: 15, expiryDate: daysFromNow(22) },
  { medicineId: 'MED-010', name: 'Amoxiclav', genericName: 'Amoxicillin + clavulanate', strength: '625 mg', category: 'Antibiotic', stock: 0, reorderLevel: 20, expiryDate: daysFromNow(90) },
  { medicineId: 'MED-011', name: 'Ciprocin', genericName: 'Ciprofloxacin', strength: '500 mg', category: 'Antibiotic', stock: 34, reorderLevel: 20, expiryDate: daysFromNow(150) },
  { medicineId: 'MED-012', name: 'Losa', genericName: 'Losartan', strength: '50 mg', category: 'Cardiovascular', stock: 26, reorderLevel: 15, expiryDate: daysFromNow(200) },
  { medicineId: 'MED-013', name: 'Xaretra', genericName: 'Rivaroxaban', strength: '15 mg', category: 'Anticoagulant', stock: 0, reorderLevel: 10, expiryDate: daysFromNow(60) },
  { medicineId: 'MED-014', name: 'Crestor', genericName: 'Rosuvastatin', strength: '10 mg', category: 'Cardiovascular', stock: 52, reorderLevel: 20, expiryDate: daysFromNow(175) },
  { medicineId: 'MED-015', name: 'Cetriz', genericName: 'Cetirizine', strength: '10 mg', category: 'Antihistamine', stock: 48, reorderLevel: 15, expiryDate: daysFromNow(190) },
  { medicineId: 'MED-016', name: 'Pred', genericName: 'Prednisolone', strength: '5 mg', category: 'Corticosteroid', stock: 9, reorderLevel: 15, expiryDate: daysFromNow(34) },
  { medicineId: 'MED-017', name: 'Dapa', genericName: 'Dapagliflozin', strength: '10 mg', category: 'Antidiabetic', stock: 22, reorderLevel: 15, expiryDate: daysFromNow(250) },
  { medicineId: 'MED-018', name: 'Mixtard', genericName: 'Insulin (30/70)', strength: '100 IU/ml', category: 'Antidiabetic', stock: 14, reorderLevel: 10, expiryDate: daysFromNow(120) },
]

export const PHARMACY_PRESCRIPTIONS: Prescription[] = [
  {
    prescriptionId: 'RX-2026-1181',
    patientId: 'PT-20255',
    patientName: 'Rafiqul Islam Sarker',
    doctorId: 'usr-doc-kamal',
    doctorName: 'Dr. Kamal Hossain',
    createdAt: hoursAgo(2),
    diagnosis: 'Community-acquired pneumonia — antibiotic course.',
    status: 'active',
    pharmacyStatus: 'not_started',
    medications: [
      { medication: 'Amoxiclav', strength: '625 mg', dosage: '1 tablet', frequency: '3 times daily', duration: '7 days', route: 'Oral', instructions: 'After food with water', quantity: 21 },
      { medication: 'Maxpro', strength: '20 mg', dosage: '1 capsule', frequency: 'Once daily', duration: '7 days', route: 'Oral', instructions: 'Before breakfast', quantity: 7 },
    ],
    warnings: [
      { type: 'allergy', severity: 'high', medication: 'Amoxiclav', message: 'Penicillin allergy recorded on the patient record — cross-check before dispensing.' },
    ],
  },
  {
    prescriptionId: 'RX-2026-1180',
    patientId: 'PT-20480',
    patientName: 'Abdul Karim Mirza',
    doctorId: 'usr-doc-fahmida',
    doctorName: 'Dr. Fahmida Yasmin',
    createdAt: hoursAgo(4),
    diagnosis: 'Hypertension — combination review.',
    status: 'sent',
    pharmacyStatus: 'preparing',
    medications: [
      { medication: 'Angilock', strength: '50 mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days', route: 'Oral', instructions: 'Avoid sudden stoppage', quantity: 60 },
      { medication: 'Amloc', strength: '5 mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', route: 'Oral', instructions: 'Take at bedtime', quantity: 30 },
    ],
    warnings: [
      { type: 'interaction', severity: 'medium', medication: 'Amloc', message: 'Possible additive hypotensive effect with metoprolol — monitor blood pressure.' },
      { type: 'duplicate', severity: 'low', message: 'Two antihypertensive agents in the same class detected.' },
    ],
  },
  {
    prescriptionId: 'RX-2026-1178',
    patientId: 'PT-20340',
    patientName: 'Laila Noor',
    doctorId: 'usr-doc-nazma',
    doctorName: 'Dr. Nazma Sultana',
    createdAt: hoursAgo(9),
    diagnosis: 'Type 2 diabetes follow-up.',
    status: 'dispensed',
    pharmacyStatus: 'dispensed',
    medications: [
      { medication: 'Orbin', strength: '500 mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '90 days', route: 'Oral', instructions: 'With meals', quantity: 180 },
      { medication: 'Dapa', strength: '10 mg', dosage: '1 tablet', frequency: 'Once daily', duration: '90 days', route: 'Oral', instructions: 'At morning', quantity: 90 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1176',
    patientId: 'PT-20501',
    patientName: 'Nasir Uddin Chowdhury',
    doctorId: 'usr-doc-rezaul',
    doctorName: 'Dr. Rezaul Karim',
    createdAt: hoursAgo(14),
    diagnosis: 'Cardiac workup — statin continuation.',
    status: 'active',
    pharmacyStatus: 'not_started',
    medications: [
      { medication: 'Crestor', strength: '10 mg', dosage: '1 tablet', frequency: 'Once daily', duration: '90 days', route: 'Oral', instructions: 'At evening', quantity: 90 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1173',
    patientId: 'PT-20063',
    patientName: 'Mokhlesur Rahman',
    doctorId: 'usr-doc-salma',
    doctorName: 'Dr. Salma Khatun',
    createdAt: hoursAgo(20),
    diagnosis: 'Post-transplant medication plan.',
    status: 'sent',
    pharmacyStatus: 'preparing',
    medications: [
      { medication: 'Maxpro', strength: '20 mg', dosage: '1 capsule', frequency: 'Once daily', duration: '30 days', route: 'Oral', instructions: 'Before breakfast', quantity: 30 },
      { medication: 'Pred', strength: '5 mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', route: 'Oral', instructions: 'Morning dose', quantity: 30 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1170',
    patientId: 'PT-20680',
    patientName: 'Monowara Begum',
    doctorId: 'usr-doc-fahmida',
    doctorName: 'Dr. Fahmida Yasmin',
    createdAt: hoursAgo(26),
    diagnosis: 'Acute sinusitis.',
    status: 'draft',
    pharmacyStatus: 'not_started',
    medications: [
      { medication: 'Ciprocin', strength: '500 mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '5 days', route: 'Oral', instructions: 'With plenty of water', quantity: 10 },
      { medication: 'Cetriz', strength: '10 mg', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days', route: 'Oral', instructions: 'At night', quantity: 5 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1165',
    patientId: 'PT-20661',
    patientName: 'Shirin Sultana',
    doctorId: 'usr-doc-kamal',
    doctorName: 'Dr. Kamal Hossain',
    createdAt: hoursAgo(32),
    diagnosis: 'Migraine — abortive + prophylaxis review.',
    status: 'dispensed',
    pharmacyStatus: 'dispensed',
    medications: [
      { medication: 'Napa', strength: '500 mg', dosage: '2 tablets', frequency: 'As needed (max 3x/day)', duration: '7 days', route: 'Oral', instructions: 'Only on headache', quantity: 42 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1162',
    patientId: 'PT-20542',
    patientName: 'Rina Akter',
    doctorId: 'usr-doc-nazma',
    doctorName: 'Dr. Nazma Sultana',
    createdAt: hoursAgo(40),
    diagnosis: 'GERD management.',
    status: 'cancelled',
    pharmacyStatus: 'not_started',
    medications: [
      { medication: 'Maxpro', strength: '20 mg', dosage: '1 capsule', frequency: 'Once daily', duration: '14 days', route: 'Oral', instructions: 'Before breakfast', quantity: 14 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1158',
    patientId: 'PT-20480',
    patientName: 'Abdul Karim Mirza',
    doctorId: 'usr-doc-rezaul',
    doctorName: 'Dr. Rezaul Karim',
    createdAt: daysAgo(1),
    diagnosis: 'Renal care supplement review.',
    status: 'active',
    pharmacyStatus: 'not_started',
    medications: [
      { medication: 'Napa', strength: '500 mg', dosage: '1 tablet', frequency: 'Every 8 hours', duration: '3 days', route: 'Oral', instructions: 'After food', quantity: 9 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1152',
    patientId: 'PT-20825',
    patientName: 'Delwar Hossain',
    doctorId: 'usr-doc-salma',
    doctorName: 'Dr. Salma Khatun',
    createdAt: daysAgo(1),
    diagnosis: 'Anticoagulation titration.',
    status: 'sent',
    pharmacyStatus: 'ready',
    medications: [
      { medication: 'Xaretra', strength: '15 mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', route: 'Oral', instructions: 'At same time daily', quantity: 30 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1147',
    patientId: 'PT-20198',
    patientName: 'Farzana Rahman',
    doctorId: 'usr-doc-kamal',
    doctorName: 'Dr. Kamal Hossain',
    createdAt: daysAgo(2),
    diagnosis: 'Diabetic nephropathy — add-on therapy.',
    status: 'draft',
    pharmacyStatus: 'not_started',
    medications: [
      { medication: 'Dapa', strength: '10 mg', dosage: '1 tablet', frequency: 'Once daily', duration: '60 days', route: 'Oral', instructions: 'At morning', quantity: 60 },
      { medication: 'Glimbi', strength: '30 mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '60 days', route: 'Oral', instructions: 'Before meals', quantity: 120 },
    ],
    warnings: [],
  },
  {
    prescriptionId: 'RX-2026-1140',
    patientId: 'PT-20312',
    patientName: 'Shirin Akter',
    doctorId: 'usr-doc-fahmida',
    doctorName: 'Dr. Fahmida Yasmin',
    createdAt: daysAgo(3),
    diagnosis: 'Post-operative course — analgesics.',
    status: 'dispensed',
    pharmacyStatus: 'dispensed',
    medications: [
      { medication: 'Napa', strength: '500 mg', dosage: '1 tablet', frequency: 'Every 6 hours', duration: '5 days', route: 'Oral', instructions: 'After food', quantity: 20 },
    ],
    warnings: [],
  },
]

export const PHARMACY_ALERTS: SafetyAlert[] = [
  {
    alertId: 'SA-1161',
    subject: 'Rafiqul Islam Sarker',
    patientId: 'PT-20255',
    context:
      'Prescription RX-2026-1181 includes Amoxiclav while the patient record lists a penicillin allergy. Confirm with the prescriber before any dispensing.',
    medication: 'Amoxiclav',
    type: 'allergy',
    severity: 'high',
    createdAt: hoursAgo(2),
    status: 'new',
    assignedRole: 'Pharmacist',
  },
  {
    alertId: 'SA-1158',
    subject: 'Abdul Karim Mirza',
    patientId: 'PT-20480',
    context:
      'Metoprolol and amlodipine together may cause additive hypotension. Suggest blood-pressure monitoring during therapy.',
    medication: 'Amloc',
    type: 'interaction',
    severity: 'medium',
    createdAt: hoursAgo(4),
    status: 'reviewing',
    assignedRole: 'Pharmacist',
  },
  {
    alertId: 'SA-1151',
    subject: 'Delwar Hossain',
    patientId: 'PT-20825',
    context:
      'Rivaroxaban 15 mg requested but the medicine is currently out of stock. Prioritize procurement or contact the prescriber.',
    medication: 'Xaretra',
    type: 'low_stock',
    severity: 'high',
    createdAt: hoursAgo(14),
    status: 'new',
    assignedRole: 'Pharmacist',
  },
  {
    alertId: 'SA-1146',
    subject: 'Azipod',
    context:
      'Azithromycin 500 mg stock is at 6 units (reorder level 15) and expires within 30 days. Restock from the distributor.',
    medication: 'Azipod',
    type: 'low_stock',
    severity: 'medium',
    createdAt: hoursAgo(22),
    status: 'new',
    assignedRole: 'Pharmacist',
  },
  {
    alertId: 'SA-1140',
    subject: 'Amoxiclav',
    context:
      'Amoxiclav 625 mg is out of stock. Equivalent antibiotic substitution must be approved by the prescriber.',
    medication: 'Amoxiclav',
    type: 'low_stock',
    severity: 'high',
    createdAt: hoursAgo(26),
    status: 'reviewing',
    assignedRole: 'Pharmacist',
  },
  {
    alertId: 'SA-1133',
    subject: 'Pred',
    context:
      'Prednisolone 5 mg expires within 35 days. Rotate stock before the expiry window.',
    medication: 'Pred',
    type: 'expiring',
    severity: 'low',
    createdAt: daysAgo(1),
    status: 'new',
    assignedRole: 'Pharmacist',
  },
  {
    alertId: 'SA-1126',
    subject: 'Tapan Kumar Das',
    patientId: 'PT-20611',
    context:
      'Prescription under review contains two NSAID preparations with overlapping dosing schedules.',
    type: 'duplicate',
    severity: 'low',
    createdAt: daysAgo(1),
    status: 'resolved',
    assignedRole: 'Doctor',
  },
  {
    alertId: 'SA-1119',
    subject: 'Shirin Akter',
    patientId: 'PT-20312',
    context:
      'NSAID allergy recorded for this patient. Cross-check analgesic prescriptions before dispensing.',
    type: 'allergy',
    severity: 'medium',
    createdAt: daysAgo(2),
    status: 'resolved',
    assignedRole: 'Pharmacist',
  },
  {
    alertId: 'SA-1112',
    subject: 'Monowara Begum',
    patientId: 'PT-20680',
    context:
      'Two respiratory agents in the same class detected on the active medication list.',
    type: 'duplicate',
    severity: 'medium',
    createdAt: daysAgo(2),
    status: 'dismissed',
    assignedRole: 'Doctor',
  },
  {
    alertId: 'SA-1101',
    subject: 'Nasir Uddin Chowdhury',
    patientId: 'PT-20501',
    context:
      'Statin plus interacting agent flagged — confirm creatine kinase monitoring plan.',
    type: 'interaction',
    severity: 'low',
    createdAt: daysAgo(3),
    status: 'resolved',
    assignedRole: 'Doctor',
  },
]