import { dischargeBillingTotals, openRequiredItems } from '@/lib/discharge'
import type { DischargeCase } from '@/types/discharge'

/**
 * Fictional discharge demo data. Patients, clinicians, vitals and notes are
 * invented for interface demonstration. A discharge summary produced here is a
 * coordination draft, not a signed clinical or legal document.
 */

const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * HOUR_MS).toISOString()
const hoursFromNow = (hours: number): string =>
  new Date(Date.now() + hours * HOUR_MS).toISOString()
const daysAgo = (days: number, hour = 9): string => {
  const date = new Date(Date.now() - days * DAY_MS)
  date.setHours(hour, 20, 0, 0)
  return date.toISOString()
}

export const DISCHARGE_CASES: DischargeCase[] = [
  {
    patientId: 'P-2026-1046',
    patientName: 'Abul Kalam Azad',
    age: 67,
    gender: 'Male',
    admissionId: 'ADM-2026-1125',
    admissionType: 'Transfer',
    ward: 'ICU',
    bed: 'ICU-105',
    attendingDoctor: 'Dr. Kamal Hossain',
    admittedAt: daysAgo(19),
    plannedDischargeAt: hoursFromNow(6),
    primaryDiagnosis: 'Severe community-acquired pneumonia with respiratory failure',
    diagnoses: [
      'Severe community-acquired pneumonia with respiratory failure',
      'Type 2 diabetes mellitus — controlled on oral therapy',
      'Hypokalaemia during diuretic therapy',
    ],
    procedures: [
      { name: 'Endotracheal intubation', performedAt: daysAgo(18, 21), performedBy: 'Dr. Rezaul Karim' },
      { name: 'Tracheostomy', performedAt: daysAgo(12, 14), performedBy: 'Dr. Rezaul Karim' },
    ],
    medications: [
      {
        medication: 'Angilock',
        strength: '50 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Continue unless the pulse drops below 55 bpm.',
        quantity: 60,
      },
      {
        medication: 'Orbin',
        strength: '500 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Take with the evening meal.',
        quantity: 60,
      },
      {
        medication: 'Potassium chloride',
        strength: '10 mL syrup',
        dosage: '10 mL',
        frequency: 'Twice daily',
        duration: '14 days',
        route: 'Oral',
        instructions: 'Dilute in water; review renal function before refill.',
        quantity: 2,
      },
    ],
    followUps: [
      {
        id: 'FU-3311',
        department: 'Pulmonology OPD',
        scheduledAt: hoursFromNow(24 * 10),
        instruction: 'Bring the tracheostomy care checklist and the discharge summary.',
      },
      {
        id: 'FU-3312',
        department: 'Physiotherapy',
        scheduledAt: hoursFromNow(24 * 3),
        instruction: 'Breathing exercises twice daily for the first fortnight.',
      },
      {
        id: 'FU-3313',
        department: 'Cardiology OPD',
        scheduledAt: hoursFromNow(24 * 21),
        instruction: 'Renal function and electrolytes recheck before the next refill.',
      },
    ],
    dischargeNotes:
      'Condition improved after 7 days of ventilation support. Extubated on day 12 and tolerating oral feeds. Afebrile for 72 hours with stable oxygen saturation on room air. Vitals stable on the day of review. Continue oral therapy with weekly electrolytes review in the community as advised by the treating team.',
    vitalsAtDischarge: {
      recordedAt: hoursAgo(5),
      heartRate: 78,
      systolic: 128,
      diastolic: 78,
      temperature: 36.8,
      spo2: 96,
      respiratoryRate: 16,
    },
    billing: {
      invoiceId: 'INV-2026-0399',
      grossAmount: 139_450,
      insuranceCoveredAmount: 74_000,
      paidAmount: 65_450,
      waivedAmount: 0,
      outstandingAmount: 0,
      status: 'clear',
    },
    documentationStatus: 'complete',
    dischargeStatus: 'ready',
    checklist: [
      { id: 'chk-1', label: 'Attending sign-off recorded', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Kamal Hossain', completedAt: hoursAgo(7) },
      { id: 'chk-2', label: 'Discharge summary drafted', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Kamal Hossain', completedAt: hoursAgo(7) },
      { id: 'chk-3', label: 'Final medication list reconciled', ownerRole: 'Pharmacist', required: true, completed: true, completedBy: 'Imran Chowdhury', completedAt: hoursAgo(9) },
      { id: 'chk-4', label: 'Investigation reports attached', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Ayesha Malik', completedAt: hoursAgo(8) },
      { id: 'chk-5', label: 'Follow-up appointments booked', ownerRole: 'Nurse', required: true, completed: true, completedBy: 'Ayesha Malik', completedAt: hoursAgo(6) },
      { id: 'chk-6', label: 'Billing settled with finance', ownerRole: 'Billing officer', required: true, completed: true, completedBy: 'Rana Khan', completedAt: hoursAgo(4) },
      { id: 'chk-7', label: 'Tracheostomy care kit handed to family', ownerRole: 'Nurse', required: false, completed: false },
      { id: 'chk-8', label: 'Transport arranged', ownerRole: 'Nurse', required: false, completed: false },
      { id: 'chk-9', label: 'Unused stock returned to the central store', ownerRole: 'Nurse', required: false, completed: false },
      { id: 'chk-10', label: 'Portable nebuliser billed separately', ownerRole: 'Billing officer', required: false, completed: false },
    ],
    pendingItems: [],
    summaryPreparedBy: 'Dr. Kamal Hossain',
  },
  {
    patientId: 'P-2026-1091',
    patientName: 'Samia Ahmed',
    age: 44,
    gender: 'Female',
    admissionId: 'ADM-2026-1175',
    admissionType: 'Scheduled',
    ward: 'General Ward',
    bed: 'GEN-104',
    attendingDoctor: 'Dr. Salma Khatun',
    admittedAt: daysAgo(3),
    plannedDischargeAt: hoursAgo(4),
    dischargedAt: hoursAgo(4),
    primaryDiagnosis: 'Symptomatic cholelithiasis — laparoscopic cholecystectomy',
    diagnoses: ['Symptomatic cholelithiasis', 'Post-operative anaemia (mild)'],
    procedures: [
      { name: 'Laparoscopic cholecystectomy', performedAt: daysAgo(1, 11), performedBy: 'Dr. Salma Khatun' },
    ],
    medications: [
      {
        medication: 'Ceporex',
        strength: '500 mg',
        dosage: '1 capsule',
        frequency: '3 times daily',
        duration: '5 days',
        route: 'Oral',
        instructions: 'Complete the full antibiotic course.',
        quantity: 15,
      },
      {
        medication: 'Napa',
        strength: '500 mg',
        dosage: '1 tablet',
        frequency: 'As needed',
        duration: '7 days',
        route: 'Oral',
        instructions: 'Only when pain exceeds 4 out of 10.',
        quantity: 20,
      },
    ],
    followUps: [
      {
        id: 'FU-3320',
        department: 'Surgery OPD',
        scheduledAt: hoursFromNow(24 * 10),
        instruction: 'Wound review and suture assessment.',
      },
    ],
    dischargeNotes:
      'Uncomplicated laparoscopic cholecystectomy. Ports healthy, no bile leak or collection on ultrasound. Mobilising independently and tolerating a light diet. Afebrile for 24 hours. Wound care instructions and the oral antibiotic course explained to the patient and the attending family member.',
    vitalsAtDischarge: {
      recordedAt: hoursAgo(6),
      heartRate: 72,
      systolic: 118,
      diastolic: 74,
      temperature: 36.9,
      spo2: 98,
      respiratoryRate: 15,
    },
    billing: {
      invoiceId: 'INV-2026-0408',
      grossAmount: 62_980,
      insuranceCoveredAmount: 18_000,
      paidAmount: 9_640,
      waivedAmount: 0,
      outstandingAmount: 35_340,
      status: 'outstanding',
    },
    documentationStatus: 'complete',
    dischargeStatus: 'discharged',
    checklist: [
      { id: 'chk-11', label: 'Attending sign-off recorded', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Salma Khatun', completedAt: hoursAgo(8) },
      { id: 'chk-12', label: 'Discharge summary drafted', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Salma Khatun', completedAt: hoursAgo(8) },
      { id: 'chk-13', label: 'Final medication list reconciled', ownerRole: 'Pharmacist', required: true, completed: true, completedBy: 'Imran Chowdhury', completedAt: hoursAgo(6) },
      { id: 'chk-14', label: 'Follow-up appointments booked', ownerRole: 'Nurse', required: true, completed: true, completedBy: 'Sumaiya Akter', completedAt: hoursAgo(5) },
      { id: 'chk-15', label: 'Billing settled with finance', ownerRole: 'Billing officer', required: true, completed: true, completedBy: 'Rana Khan', completedAt: hoursAgo(5) },
      { id: 'chk-16', label: 'Transport arranged', ownerRole: 'Nurse', required: false, completed: true, completedBy: 'Sumaiya Akter', completedAt: hoursAgo(5) },
    ],
    pendingItems: ['File the insurance claim within the policy window'],
    summaryPreparedBy: 'Dr. Salma Khatun',
  },
  {
    patientId: 'P-2026-1051',
    patientName: 'Kabir Chowdhury',
    age: 58,
    gender: 'Male',
    admissionId: 'ADM-2026-1185',
    admissionType: 'Elective',
    ward: 'Cardiology',
    bed: 'CAR-101',
    attendingDoctor: 'Dr. Nazma Sultana',
    admittedAt: daysAgo(6),
    plannedDischargeAt: hoursFromNow(20),
    primaryDiagnosis: 'Coronary artery disease — percutaneous coronary intervention',
    diagnoses: [
      'Coronary artery disease — percutaneous coronary intervention',
      'Essential hypertension',
      'Dyslipidaemia',
    ],
    procedures: [
      { name: 'Coronary angiography', performedAt: daysAgo(4, 13), performedBy: 'Dr. Nazma Sultana' },
      { name: 'Percutaneous coronary intervention with stent', performedAt: daysAgo(4, 16), performedBy: 'Dr. Nazma Sultana' },
    ],
    medications: [
      {
        medication: 'Clopidogrel',
        strength: '75 mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '12 months',
        route: 'Oral',
        instructions: 'Do not stop without cardiology advice. Report any unusual bleeding.',
        quantity: 365,
      },
      {
        medication: 'Crestor',
        strength: '10 mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '12 months',
        route: 'Oral',
        instructions: 'Take in the evening.',
        quantity: 365,
      },
      {
        medication: 'Angilock',
        strength: '50 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Pulse check advised before each dose in the first week.',
        quantity: 60,
      },
    ],
    followUps: [
      {
        id: 'FU-3330',
        department: 'Cardiology OPD',
        scheduledAt: hoursFromNow(24 * 30),
        instruction: 'DAPT adherence review and lipid profile recheck.',
      },
    ],
    dischargeNotes:
      'Uncomplicated PCI with a single stent to the left anterior descending artery. Dual antiplatelet therapy commenced. Radial access site healthy, no haematoma. Cardiac function unchanged on echo. Counselling on activity, diet and adherence completed with the family member present.',
    vitalsAtDischarge: {
      recordedAt: hoursAgo(3),
      heartRate: 68,
      systolic: 126,
      diastolic: 76,
      temperature: 36.7,
      spo2: 97,
      respiratoryRate: 14,
    },
    billing: {
      invoiceId: 'INV-2026-0411',
      grossAmount: 87_480,
      insuranceCoveredAmount: 48_000,
      paidAmount: 30_000,
      waivedAmount: 0,
      outstandingAmount: 9_480,
      status: 'outstanding',
    },
    documentationStatus: 'in_progress',
    dischargeStatus: 'pending',
    checklist: [
      { id: 'chk-21', label: 'Attending sign-off recorded', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Nazma Sultana', completedAt: hoursAgo(10) },
      { id: 'chk-22', label: 'Discharge summary drafted', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Nazma Sultana', completedAt: hoursAgo(10) },
      { id: 'chk-23', label: 'Final medication list reconciled', ownerRole: 'Pharmacist', required: true, completed: true, completedBy: 'Imran Chowdhury', completedAt: hoursAgo(12) },
      { id: 'chk-24', label: 'Follow-up appointments booked', ownerRole: 'Nurse', required: true, completed: true, completedBy: 'Ruma Begum', completedAt: hoursAgo(2) },
      { id: 'chk-25', label: 'Billing settled with finance', ownerRole: 'Billing officer', required: true, completed: false },
      { id: 'chk-26', label: 'Insurance claim submitted', ownerRole: 'Billing officer', required: false, completed: true, completedBy: 'Rana Khan', completedAt: hoursAgo(1) },
    ],
    pendingItems: [
      'Outstanding balance to be cleared before release',
      'Awaiting insurer utilisation report',
    ],
    summaryPreparedBy: 'Dr. Nazma Sultana',
  },
  {
    patientId: 'P-2026-1072',
    patientName: 'Mithila Rahman',
    age: 31,
    gender: 'Female',
    admissionId: 'ADM-2026-1142',
    admissionType: 'Emergency',
    ward: 'Emergency',
    bed: 'EMG-103',
    attendingDoctor: 'Dr. Mahmudul Islam',
    admittedAt: daysAgo(1),
    plannedDischargeAt: hoursFromNow(4),
    primaryDiagnosis: 'Acute exacerbation of bronchial asthma',
    diagnoses: ['Acute exacerbation of bronchial asthma', 'Mild obesity-related restrictive pattern'],
    procedures: [
      { name: 'Nebulisation protocol', performedAt: daysAgo(1, 18), performedBy: 'Sumaiya Akter' },
    ],
    medications: [
      {
        medication: 'Montair',
        strength: '10 mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Evening dose; do not double up after a missed dose.',
        quantity: 30,
      },
      {
        medication: 'Pred',
        strength: '5 mg',
        dosage: '2 tablets',
        frequency: 'Once daily',
        duration: '5 days',
        route: 'Oral',
        instructions: 'Short course only — complete the five-day course.',
        quantity: 10,
      },
    ],
    followUps: [
      {
        id: 'FU-3340',
        department: 'Respiratory OPD',
        scheduledAt: hoursFromNow(24 * 14),
        instruction: 'Spirometry review and inhaler technique check.',
      },
    ],
    dischargeNotes:
      'Acute asthma exacerbation responding to nebulised bronchodilator and short-course oral steroid. Speaking in full sentences with saturation maintained on ambient air. Inhaler technique reviewed with the patient. Return triggers explained and an action plan issued in writing.',
    vitalsAtDischarge: {
      recordedAt: hoursAgo(2),
      heartRate: 84,
      systolic: 116,
      diastolic: 70,
      temperature: 36.6,
      spo2: 97,
      respiratoryRate: 18,
    },
    billing: {
      invoiceId: 'INV-2026-0402',
      grossAmount: 10_740,
      insuranceCoveredAmount: 4_590,
      paidAmount: 6_150,
      waivedAmount: 0,
      outstandingAmount: 0,
      status: 'clear',
    },
    documentationStatus: 'in_progress',
    dischargeStatus: 'pending',
    checklist: [
      { id: 'chk-31', label: 'Attending sign-off recorded', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Mahmudul Islam', completedAt: hoursAgo(3) },
      { id: 'chk-32', label: 'Discharge summary drafted', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Mahmudul Islam', completedAt: hoursAgo(3) },
      { id: 'chk-33', label: 'Final medication list reconciled', ownerRole: 'Pharmacist', required: true, completed: true, completedBy: 'Imran Chowdhury', completedAt: hoursAgo(2) },
      { id: 'chk-34', label: 'Investigation reports attached', ownerRole: 'Doctor', required: true, completed: false },
      { id: 'chk-35', label: 'Follow-up appointments booked', ownerRole: 'Nurse', required: true, completed: false },
      { id: 'chk-36', label: 'Billing settled with finance', ownerRole: 'Billing officer', required: true, completed: true, completedBy: 'Rana Khan', completedAt: hoursAgo(1) },
      { id: 'chk-37', label: 'Written asthma action plan issued', ownerRole: 'Nurse', required: false, completed: true, completedBy: 'Sumaiya Akter', completedAt: hoursAgo(1) },
    ],
    pendingItems: ['Chest radiograph report still pending from the imaging desk'],
    summaryPreparedBy: 'Dr. Mahmudul Islam',
  },
  {
    patientId: 'P-2026-1082',
    patientName: 'Babul Miah',
    age: 62,
    gender: 'Male',
    admissionId: 'ADM-2026-1131',
    admissionType: 'Elective',
    ward: 'General Ward',
    bed: 'GEN-103',
    attendingDoctor: 'Dr. Fahmida Yasmin',
    admittedAt: daysAgo(2),
    plannedDischargeAt: hoursFromNow(30),
    primaryDiagnosis: 'Age-related nuclear cataract — right eye',
    diagnoses: ['Age-related nuclear cataract, right eye', 'Mild systemic hypertension'],
    procedures: [
      { name: 'Phacoemulsification with intraocular lens implant', performedAt: daysAgo(1, 10), performedBy: 'Dr. Rezaul Karim' },
    ],
    medications: [
      {
        medication: 'Moxifloxacin eye drop',
        strength: '0.5%',
        dosage: '1 drop',
        frequency: '4 times daily',
        duration: '10 days',
        route: 'Topical',
        instructions: 'Instil into the lower conjunctival sac; wash hands first.',
        quantity: 1,
      },
      {
        medication: 'Prednisolone eye drop',
        strength: '1%',
        dosage: '1 drop',
        frequency: '3 times daily',
        duration: '14 days',
        route: 'Topical',
        instructions: 'Taper only as advised at the review.',
        quantity: 1,
      },
    ],
    followUps: [
      {
        id: 'FU-3350',
        department: 'Ophthalmology OPD',
        scheduledAt: hoursFromNow(24 * 7),
        instruction: 'Suture removal and vision check.',
      },
    ],
    dischargeNotes:
      'Uneventful phacoemulsification under topical anaesthesia. Intraocular pressure within range on day one. Patient comfortable, vision improving. Drops explained with a written schedule. No operative complications noted.',
    vitalsAtDischarge: {
      recordedAt: hoursAgo(1),
      heartRate: 76,
      systolic: 132,
      diastolic: 82,
      temperature: 36.8,
      spo2: 98,
      respiratoryRate: 15,
    },
    billing: {
      invoiceId: 'INV-2026-0400',
      grossAmount: 48_700,
      insuranceCoveredAmount: 0,
      paidAmount: 0,
      waivedAmount: 0,
      outstandingAmount: 48_700,
      status: 'outstanding',
    },
    documentationStatus: 'in_progress',
    dischargeStatus: 'pending',
    checklist: [
      { id: 'chk-41', label: 'Attending sign-off recorded', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Fahmida Yasmin', completedAt: hoursAgo(4) },
      { id: 'chk-42', label: 'Discharge summary drafted', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Fahmida Yasmin', completedAt: hoursAgo(4) },
      { id: 'chk-43', label: 'Final medication list reconciled', ownerRole: 'Pharmacist', required: true, completed: false },
      { id: 'chk-44', label: 'Investigation reports attached', ownerRole: 'Doctor', required: true, completed: false },
      { id: 'chk-45', label: 'Follow-up appointments booked', ownerRole: 'Nurse', required: true, completed: true, completedBy: 'Shathi Rani', completedAt: hoursAgo(2) },
      { id: 'chk-46', label: 'Billing settled with finance', ownerRole: 'Billing officer', required: true, completed: false },
    ],
    pendingItems: [
      'Finalise the self-pay invoice INV-2026-0400 before the patient is released',
      'Ophthalmology operative note to be scanned',
    ],
    summaryPreparedBy: 'Dr. Fahmida Yasmin',
  },
  {
    patientId: 'P-2026-1044',
    patientName: 'Kamrul Islam',
    age: 53,
    gender: 'Male',
    admissionId: 'ADM-2026-1160',
    admissionType: 'Emergency',
    ward: 'ICU',
    bed: 'ICU-103',
    attendingDoctor: 'Dr. Rezaul Karim',
    admittedAt: daysAgo(14),
    plannedDischargeAt: hoursAgo(30),
    primaryDiagnosis: 'Chronic kidney disease with end-stage renal disease — haemodialysis',
    diagnoses: [
      'Chronic kidney disease, end-stage renal disease',
      'Anaemia of chronic kidney disease',
      'Secondary hyperparathyroidism',
    ],
    procedures: [
      { name: 'Haemodialysis via left internal jugular catheter', performedAt: daysAgo(13, 8), performedBy: 'Nephrology team' },
    ],
    medications: [
      {
        medication: 'Dapa',
        strength: '10 mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Hold only on the day of dialysis as advised.',
        quantity: 30,
      },
      {
        medication: 'Erythropoietin',
        strength: '4000 IU',
        dosage: '1 injection',
        frequency: 'Weekly',
        duration: '8 weeks',
        route: 'Subcutaneous',
        instructions: 'Store in the refrigerator; rotate injection sites.',
        quantity: 8,
      },
    ],
    followUps: [
      {
        id: 'FU-3360',
        department: 'Nephrology OPD',
        scheduledAt: hoursFromNow(24 * 4),
        instruction: 'Catheter site review and monthly bloods.',
      },
    ],
    dischargeNotes:
      'Dialysis access functioning with good blood flow. Catheter exit site clean and dry. Haemoglobin improved on erythropoietin. Fluid balance advised with a daily target. Dietary counselling provided for potassium and phosphate restriction.',
    vitalsAtDischarge: {
      recordedAt: hoursAgo(2),
      heartRate: 74,
      systolic: 148,
      diastolic: 88,
      temperature: 36.9,
      spo2: 95,
      respiratoryRate: 17,
    },
    billing: {
      invoiceId: 'INV-2026-0405',
      grossAmount: 142_200,
      insuranceCoveredAmount: 0,
      paidAmount: 0,
      waivedAmount: 142_200,
      outstandingAmount: 0,
      status: 'clear',
    },
    documentationStatus: 'complete',
    dischargeStatus: 'discharged',
    dischargedAt: hoursAgo(30),
    checklist: [
      { id: 'chk-51', label: 'Attending sign-off recorded', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Rezaul Karim', completedAt: hoursAgo(32) },
      { id: 'chk-52', label: 'Discharge summary drafted', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Rezaul Karim', completedAt: hoursAgo(32) },
      { id: 'chk-53', label: 'Final medication list reconciled', ownerRole: 'Pharmacist', required: true, completed: true, completedBy: 'Imran Chowdhury', completedAt: hoursAgo(34) },
      { id: 'chk-54', label: 'Investigation reports attached', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Ayesha Malik', completedAt: hoursAgo(33) },
      { id: 'chk-55', label: 'Follow-up appointments booked', ownerRole: 'Nurse', required: true, completed: true, completedBy: 'Anjuman Ara', completedAt: hoursAgo(31) },
      { id: 'chk-56', label: 'Billing settled with finance', ownerRole: 'Billing officer', required: true, completed: true, completedBy: 'Rana Khan', completedAt: hoursAgo(31) },
      { id: 'chk-57', label: 'Transport arranged', ownerRole: 'Nurse', required: false, completed: true, completedBy: 'Anjuman Ara', completedAt: hoursAgo(30) },
    ],
    pendingItems: [
      'The admission invoice INV-2026-0405 was cancelled and re-raised under the chronic care package',
    ],
    summaryPreparedBy: 'Dr. Rezaul Karim',
  },
  {
    patientId: 'P-2026-1063',
    patientName: 'Toufiq Elahi',
    age: 39,
    gender: 'Male',
    admissionId: 'ADM-2026-1163',
    admissionType: 'Emergency',
    ward: 'Neurology',
    bed: 'NEU-103',
    attendingDoctor: 'Dr. Rezaul Karim',
    admittedAt: daysAgo(5),
    plannedDischargeAt: hoursFromNow(44),
    primaryDiagnosis: 'Transient ischaemic attack — anterior circulation',
    diagnoses: ['Transient ischaemic attack', 'Atrial fibrillation', 'Uncontrolled hypertension'],
    procedures: [
      { name: 'Carotid duplex ultrasonography', performedAt: daysAgo(3, 11), performedBy: 'Dr. Fahmida Yasmin' },
    ],
    medications: [
      {
        medication: 'Losa',
        strength: '50 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Take at fixed times to keep the blood pressure steady.',
        quantity: 60,
      },
      {
        medication: 'Xaretra',
        strength: '15 mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Report black stools, bleeding or unusual bruising.',
        quantity: 30,
      },
    ],
    followUps: [
      {
        id: 'FU-3370',
        department: 'Neurology OPD',
        scheduledAt: hoursFromNow(24 * 14),
        instruction: 'Repeat ECG and anticoagulation review.',
      },
    ],
    dischargeNotes:
      'Symptoms resolved within 24 hours with no diffusion restriction on imaging. AF identified on ECG and anticoagulation started. Blood pressure improving. Headache and transient vision changes explained with written warning signs and escalation advice.',
    vitalsAtDischarge: {
      recordedAt: hoursAgo(3),
      heartRate: 88,
      systolic: 138,
      diastolic: 86,
      temperature: 36.7,
      spo2: 97,
      respiratoryRate: 16,
    },
    billing: {
      invoiceId: 'INV-2026-0413',
      grossAmount: 77_830,
      insuranceCoveredAmount: 0,
      paidAmount: 15_000,
      waivedAmount: 0,
      outstandingAmount: 62_830,
      status: 'outstanding',
    },
    documentationStatus: 'not_started',
    dischargeStatus: 'pending',
    checklist: [
      { id: 'chk-61', label: 'Attending sign-off recorded', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Rezaul Karim', completedAt: hoursAgo(5) },
      { id: 'chk-62', label: 'Discharge summary drafted', ownerRole: 'Doctor', required: true, completed: false },
      { id: 'chk-63', label: 'Final medication list reconciled', ownerRole: 'Pharmacist', required: true, completed: false },
      { id: 'chk-64', label: 'Investigation reports attached', ownerRole: 'Doctor', required: true, completed: false },
      { id: 'chk-65', label: 'Follow-up appointments booked', ownerRole: 'Nurse', required: true, completed: false },
      { id: 'chk-66', label: 'Billing settled with finance', ownerRole: 'Billing officer', required: true, completed: false },
      { id: 'chk-67', label: 'Insurance pre-authorisation declined', ownerRole: 'Billing officer', required: false, completed: true, completedBy: 'Rana Khan', completedAt: hoursAgo(26) },
    ],
    pendingItems: [
      'Insurance claim rejected — advise the family about self-pay options',
      'Carotid imaging report to be collected from imaging',
    ],
    summaryPreparedBy: 'Dr. Rezaul Karim',
  },
  {
    patientId: 'P-2026-1052',
    patientName: 'Jannatul Ferdous',
    age: 48,
    gender: 'Female',
    admissionId: 'ADM-2026-1148',
    admissionType: 'Scheduled',
    ward: 'Cardiology',
    bed: 'CAR-102',
    attendingDoctor: 'Dr. Nazma Sultana',
    admittedAt: daysAgo(2),
    plannedDischargeAt: hoursFromNow(28),
    primaryDiagnosis: 'Palpitations with frequent premature atrial contractions',
    diagnoses: ['Frequent premature atrial contractions', 'Hypothyroidism'],
    procedures: [
      { name: '24-hour Holter monitoring', performedAt: daysAgo(1, 15), performedBy: 'Cardiology technician' },
    ],
    medications: [
      {
        medication: 'Angilock',
        strength: '25 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Start at the lower strength and titrate at review.',
        quantity: 60,
      },
    ],
    followUps: [
      {
        id: 'FU-3380',
        department: 'Cardiology OPD',
        scheduledAt: hoursFromNow(24 * 21),
        instruction: 'Holter results review and dose titration.',
      },
    ],
    dischargeNotes:
      'Palpitations reduced on a low beta-blocker dose. Holter shows frequent unifocal ectopics without sustained arrhythmia. Thyroid function under monitoring. Caffeine and stimulant advice given in writing.',
    vitalsAtDischarge: {
      recordedAt: hoursAgo(4),
      heartRate: 70,
      systolic: 122,
      diastolic: 78,
      temperature: 36.6,
      spo2: 98,
      respiratoryRate: 14,
    },
    billing: {
      invoiceId: 'INV-2026-0403',
      grossAmount: 27_490,
      insuranceCoveredAmount: 0,
      paidAmount: 18_000,
      waivedAmount: 0,
      outstandingAmount: 9_490,
      status: 'outstanding',
    },
    documentationStatus: 'in_progress',
    dischargeStatus: 'blocked',
    checklist: [
      { id: 'chk-71', label: 'Attending sign-off recorded', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Nazma Sultana', completedAt: hoursAgo(6) },
      { id: 'chk-72', label: 'Discharge summary drafted', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Dr. Nazma Sultana', completedAt: hoursAgo(6) },
      { id: 'chk-73', label: 'Final medication list reconciled', ownerRole: 'Pharmacist', required: true, completed: true, completedBy: 'Imran Chowdhury', completedAt: hoursAgo(7) },
      { id: 'chk-74', label: 'Investigation reports attached', ownerRole: 'Doctor', required: true, completed: true, completedBy: 'Ayesha Malik', completedAt: hoursAgo(5) },
      { id: 'chk-75', label: 'Follow-up appointments booked', ownerRole: 'Nurse', required: true, completed: true, completedBy: 'Nusrat Jahan', completedAt: hoursAgo(3) },
      { id: 'chk-76', label: 'Billing settled with finance', ownerRole: 'Billing officer', required: true, completed: false },
      { id: 'chk-77', label: 'Transport arranged', ownerRole: 'Nurse', required: false, completed: false },
    ],
    pendingItems: [
      'Settle the ৳9,490 balance on invoice INV-2026-0403 with the finance office',
      'Collect the Holter device deposit at the pharmacy counter',
    ],
    summaryPreparedBy: 'Dr. Nazma Sultana',
  },
]

/**
 * Integrity guard for the discharge dataset. The readiness badge, the "release
 * for discharge" action and the billing panel all read the same fields, so a
 * case that is flagged "ready" while still carrying blockers — or a balance that
 * does not add up — would contradict the UI. Validated once at module load.
 */
function assertDischargeDatasetIsConsistent(cases: DischargeCase[]): void {
  const fail = (message: string) => {
    throw new Error(`Discharge demo dataset is inconsistent — ${message}`)
  }

  const seen = new Set<string>()
  for (const entry of cases) {
    if (seen.has(entry.patientId)) fail(`duplicate patient ${entry.patientId}.`)
    seen.add(entry.patientId)

    const totals = dischargeBillingTotals(entry.billing)
    if (totals.outstandingAmount !== entry.billing.outstandingAmount) {
      fail(
        `${entry.patientId} balance does not add up: ৳${totals.outstandingAmount} computed vs ৳${entry.billing.outstandingAmount} recorded.`,
      )
    }
    if (
      entry.billing.status === 'clear' &&
      entry.billing.outstandingAmount > 0
    ) {
      fail(`${entry.patientId} is marked settled with ৳${entry.billing.outstandingAmount} outstanding.`)
    }

    const open = openRequiredItems(entry.checklist)
    if (entry.documentationStatus === 'complete' && open.length > 0) {
      fail(`${entry.patientId} documentation is complete but ${open.length} required item(s) are open.`)
    }

    if (entry.dischargeStatus === 'ready') {
      if (entry.documentationStatus !== 'complete') {
        fail(`${entry.patientId} is ready but documentation is ${entry.documentationStatus}.`)
      }
      if (open.length) fail(`${entry.patientId} is ready but ${open.length} required item(s) are open.`)
      if (entry.billing.outstandingAmount > 0) fail(`${entry.patientId} is ready with an unsettled balance.`)
      if (entry.pendingItems.length) fail(`${entry.patientId} is ready with open coordination items.`)
    }

    if (entry.dischargeStatus === 'discharged' && !entry.dischargedAt) {
      fail(`${entry.patientId} is discharged without a discharge timestamp.`)
    }
    if (entry.dischargeStatus !== 'discharged' && entry.dischargedAt) {
      fail(`${entry.patientId} has a discharge timestamp but status "${entry.dischargeStatus}".`)
    }
  }
}

assertDischargeDatasetIsConsistent(DISCHARGE_CASES)