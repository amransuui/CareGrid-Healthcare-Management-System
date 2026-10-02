import {
  invoiceCoveragePercent,
  invoiceGross,
  invoiceOutstanding,
} from '@/lib/billing'
import type {
  InsuranceClaim,
  InsuranceProvider,
  Invoice,
  InvoiceLine,
} from '@/types/billing'

/**
 * Fictional billing demo dataset. Every amount is invented Bangladeshi Taka
 * for a university lab demonstration: no real patient, insurer, admission or
 * payment is represented, and nothing here is a real financial document.
 */

const DAY_MS = 86_400_000

const daysAgo = (days: number, hour = 10): string => {
  const date = new Date(Date.now() - days * DAY_MS)
  date.setHours(hour, 15, 0, 0)
  return date.toISOString()
}

let lineCounter = 0
const line = (
  description: string,
  category: InvoiceLine['category'],
  quantity: number,
  unitPrice: number,
): InvoiceLine => ({
  lineId: `L-${(lineCounter += 1).toString().padStart(4, '0')}`,
  description,
  category,
  quantity,
  unitPrice,
})

/**
 * Integrity guard for the demo ledger. Hand-typed totals drift, and a "paid"
 * invoice that still shows money outstanding would contradict the KPI cards,
 * the invoice table and the discharge billing panels at the same time. The
 * dataset is therefore validated once at module load.
 */
function assertLedgerIsConsistent(
  invoiceList: Invoice[],
  claimList: InsuranceClaim[],
): void {
  const fail = (message: string) => {
    throw new Error(`Billing demo dataset is inconsistent — ${message}`)
  }

  for (const invoice of invoiceList) {
    const gross = invoiceGross(invoice)
    const outstanding = invoiceOutstanding(invoice)
    const label = invoice.invoiceId

    if (invoice.discount > gross && invoice.discount > 0) fail(`${label} discounts more than its subtotal.`)
    if (invoiceCoveragePercent(invoice) > 100) fail(`${label} insurance exceeds the invoice total.`)

    switch (invoice.status) {
      case 'draft':
      case 'cancelled':
        if (invoice.paidAmount !== 0) fail(`${label} is ${invoice.status} but records a payment.`)
        if (invoice.insuranceCoveredAmount !== 0) fail(`${label} is ${invoice.status} but records insurer coverage.`)
        break
      case 'pending':
      case 'partially_paid':
        if (outstanding <= 0) fail(`${label} is ${invoice.status} with nothing outstanding.`)
        break
      case 'paid':
        if (outstanding > 0) fail(`${label} is paid but still has ৳${outstanding} outstanding.`)
        break
    }

    if (
      invoice.insuranceCoveredAmount > 0 &&
      invoice.insuranceStatus !== 'approved' &&
      invoice.insuranceStatus !== 'partially_approved'
    ) {
      fail(`${label} records coverage while coverage is "${invoice.insuranceStatus}".`)
    }
  }

  for (const claim of claimList) {
    const invoice = invoiceList.find((entry) => entry.invoiceId === claim.invoiceId)
    if (!invoice) {
      fail(`${claim.claimId} points at unknown invoice ${claim.invoiceId}.`)
      continue
    }
    if (claim.amount !== invoiceGross(invoice)) {
      fail(
        `${claim.claimId} claims ৳${claim.amount} but ${claim.invoiceId} bills ৳${invoiceGross(invoice)}.`,
      )
    }
    if (claim.approvedAmount > claim.amount) fail(`${claim.claimId} approves more than it claims.`)
    if (claim.approvedAmount > 0 && claim.status !== 'approved' && claim.status !== 'paid') {
      fail(`${claim.claimId} has an approved amount but is "${claim.status}".`)
    }
    if (claim.status !== 'rejected' && claim.rejectionReason) {
      fail(`${claim.claimId} is "${claim.status}" yet carries a rejection reason.`)
    }
    const lastEvent = claim.history.at(-1)
    if (lastEvent && lastEvent.status !== claim.status) {
      fail(`${claim.claimId} history ends at "${lastEvent.status}" but the claim is "${claim.status}".`)
    }
  }
}

export const INSURANCE_PROVIDERS: InsuranceProvider[] = [
  {
    providerId: 'INS-01',
    name: 'Bangladesh Health Insurance Company Ltd.',
    shortName: 'BHI',
    contactPerson: 'Farhana Ferdous',
    phone: '+8801711002200',
    email: 'claims@bhi-demo.bd',
    coverageRatio: 70,
    activePolicies: 412,
    claimsThisMonth: 26,
    avgSettlementDays: 12,
  },
  {
    providerId: 'INS-02',
    name: 'National Islami Insurance — Health',
    shortName: 'NII',
    contactPerson: 'Tanvir Hossain',
    phone: '+8801811003300',
    email: 'healthclaims@nii-demo.bd',
    coverageRatio: 65,
    activePolicies: 288,
    claimsThisMonth: 19,
    avgSettlementDays: 15,
  },
  {
    providerId: 'INS-03',
    name: 'Delta Life Insurance Company',
    shortName: 'DLI',
    contactPerson: 'Nusrat Jahan',
    phone: '+8801911004400',
    email: 'providerdesk@dli-demo.bd',
    coverageRatio: 60,
    activePolicies: 205,
    claimsThisMonth: 14,
    avgSettlementDays: 9,
  },
  {
    providerId: 'INS-04',
    name: 'Metropolitan Health Fund',
    shortName: 'MHF',
    contactPerson: 'Ayesha Siddiqua',
    phone: '+8801611005500',
    email: 'care@mhf-demo.bd',
    coverageRatio: 80,
    activePolicies: 96,
    claimsThisMonth: 7,
    avgSettlementDays: 18,
  },
  {
    providerId: 'INS-05',
    name: 'Sunrise Medicare Scheme',
    shortName: 'SMS',
    contactPerson: 'Imtiaz Rahman',
    phone: '+8801511006600',
    email: 'claims@sunrise-demo.bd',
    coverageRatio: 55,
    activePolicies: 143,
    claimsThisMonth: 11,
    avgSettlementDays: 21,
  },
]

export const BILLING_INVOICES: Invoice[] = [
  {
    invoiceId: 'INV-2026-0413',
    patientId: 'P-2026-1063',
    patientName: 'Shahidul Islam',
    admissionId: 'ADM-2026-1179',
    admissionType: 'Transfer',
    ward: 'High Dependency Unit',
    bed: 'HDU-102',
    periodStart: daysAgo(6),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 17),
    status: 'pending',
    discount: 0,
    insuranceStatus: 'self_pay',
    insuranceCoveredAmount: 0,
    paidAmount: 15_000,
    preparedBy: 'Rana Khan',
    lines: [
      line('High dependency unit bed charge (per day)', 'room', 6, 5_800),
      line('Peritoneal dialysis — catheter insertion', 'procedure', 1, 18_000),
      line('Inj. Ceftriaxone 1 g', 'medication', 8, 640),
      line('Tab. Losa 50 mg', 'medication', 20, 13),
      line('Renal function panel', 'laboratory', 3, 1_850),
      line('Dialysis catheter dressing', 'consumable', 6, 900),
      line('Consultant nephrology review (daily)', 'service', 6, 1_450),
    ],
  },
  {
    invoiceId: 'INV-2026-0412',
    patientId: 'P-2026-1042',
    patientName: 'Mohammad Rahman',
    admissionId: 'ADM-2026-1188',
    admissionType: 'Emergency',
    ward: 'ICU',
    bed: 'ICU-101',
    periodStart: daysAgo(9),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 11),
    status: 'pending',
    discount: 0,
    insuranceProviderId: 'INS-01',
    insuranceStatus: 'pending',
    insuranceCoveredAmount: 0,
    paidAmount: 40_000,
    preparedBy: 'Rana Khan',
    lines: [
      line('ICU bed charge (per day)', 'room', 9, 8_500),
      line('Ventilator support', 'service', 9, 4_200),
      line('Inj. Ceftriaxone 1 g', 'medication', 18, 650),
      line('Inj. Meropenem 1 g', 'medication', 12, 1_450),
      line('Complete blood count', 'laboratory', 4, 1_200),
      line('CT scan of brain', 'procedure', 1, 14_000),
      line('Central line dressing kit', 'consumable', 9, 780),
      line('Doctor consultation (critical)', 'service', 9, 1_800),
    ],
  },
  {
    invoiceId: 'INV-2026-0411',
    patientId: 'P-2026-1051',
    patientName: 'Kabir Chowdhury',
    admissionId: 'ADM-2026-1185',
    admissionType: 'Elective',
    ward: 'Cardiology',
    bed: 'CAR-101',
    periodStart: daysAgo(6),
    periodEnd: daysAgo(1),
    issuedAt: daysAgo(1, 15),
    status: 'partially_paid',
    discount: 2_500,
    discountReason: 'Staff relative concession (demo policy)',
    insuranceProviderId: 'INS-02',
    insuranceStatus: 'partially_approved',
    insuranceCoveredAmount: 48_000,
    paidAmount: 30_000,
    preparedBy: 'Rana Khan',
    lines: [
      line('Cardiology cabin charge (per day)', 'room', 6, 5_600),
      line('Coronary angiography', 'procedure', 1, 42_000),
      line('Tab. Clopidogrel 75 mg', 'medication', 30, 14),
      line('Tab. Atorvastatin 20 mg', 'medication', 30, 12),
      line('Lipid profile', 'laboratory', 2, 1_850),
      line('ECG', 'procedure', 3, 900),
      line('Nursing care (per day)', 'service', 6, 1_200),
    ],
  },
  {
    invoiceId: 'INV-2026-0410',
    patientId: 'P-2026-1081',
    patientName: 'Rehana Parvin',
    admissionId: 'ADM-2026-1181',
    admissionType: 'Emergency',
    ward: 'General Ward',
    bed: 'GEN-101',
    periodStart: daysAgo(4),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 9),
    status: 'pending',
    discount: 0,
    insuranceProviderId: 'INS-03',
    insuranceStatus: 'pending',
    insuranceCoveredAmount: 0,
    paidAmount: 12_000,
    preparedBy: 'Rana Khan',
    lines: [
      line('General ward bed charge (per day)', 'room', 4, 3_200),
      line('Tab. Napa 500 mg', 'medication', 20, 8),
      line('Tab. Amdocal 5 mg', 'medication', 20, 11),
      line('Sigmoidoscopy', 'procedure', 1, 12_500),
      line('Haemoglobin profile', 'laboratory', 2, 1_100),
      line('IV cannula', 'consumable', 2, 650),
    ],
  },
  {
    invoiceId: 'INV-2026-0409',
    patientId: 'P-2026-1061',
    patientName: 'Nur Mohammad',
    admissionId: 'ADM-2026-1178',
    admissionType: 'Emergency',
    ward: 'Neurology',
    bed: 'NEU-101',
    periodStart: daysAgo(8),
    periodEnd: daysAgo(2),
    issuedAt: daysAgo(2, 16),
    status: 'paid',
    discount: 0,
    insuranceProviderId: 'INS-04',
    insuranceStatus: 'approved',
    insuranceCoveredAmount: 46_322,
    paidAmount: 25_000,
    preparedBy: 'Rana Khan',
    lines: [
      line('Neurology ward bed charge (per day)', 'room', 7, 4_400),
      line('MRI of brain (with contrast)', 'procedure', 1, 22_000),
      line('Lumbar puncture', 'procedure', 1, 6_500),
      line('Tab. Losa 50 mg', 'medication', 14, 13),
      line('Inj. Dexamethasone', 'medication', 7, 320),
      line('Serum electrolytes', 'laboratory', 3, 1_400),
      line('Physiotherapy session', 'service', 6, 900),
    ],
  },
  {
    invoiceId: 'INV-2026-0408',
    patientId: 'P-2026-1091',
    patientName: 'Samia Ahmed',
    admissionId: 'ADM-2026-1175',
    admissionType: 'Scheduled',
    ward: 'General Ward',
    bed: 'GEN-104',
    periodStart: daysAgo(3),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 14),
    status: 'partially_paid',
    discount: 1_200,
    discountReason: 'Discharge-day goodwill adjustment (demo)',
    insuranceProviderId: 'INS-05',
    insuranceStatus: 'approved',
    insuranceCoveredAmount: 18_000,
    paidAmount: 9_640,
    preparedBy: 'Rana Khan',
    lines: [
      line('General ward bed charge (per day)', 'room', 3, 3_200),
      line('Laparoscopic cholecystectomy', 'procedure', 1, 46_000),
      line('Tab. Cefradine 500 mg', 'medication', 15, 16),
      line('LFT panel', 'laboratory', 2, 1_950),
      line('Surgical dressing pack', 'consumable', 6, 540),
      line('Post-operative follow-up', 'service', 1, 1_200),
    ],
  },
  {
    invoiceId: 'INV-2026-0407',
    patientId: 'P-2026-1071',
    patientName: 'Sajid Hasan',
    admissionId: 'ADM-2026-1170',
    admissionType: 'Emergency',
    ward: 'Emergency',
    bed: 'EMG-101',
    periodStart: daysAgo(1),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 18),
    status: 'pending',
    discount: 0,
    insuranceStatus: 'self_pay',
    insuranceCoveredAmount: 0,
    paidAmount: 0,
    preparedBy: 'Rana Khan',
    lines: [
      line('Emergency observation (per day)', 'room', 1, 2_400),
      line('Dressing of road-traffic wound', 'procedure', 1, 5_400),
      line('Suture pack', 'consumable', 1, 1_350),
      line('Blood group & Rh test', 'laboratory', 1, 700),
      line('Tetanus prophylaxis', 'medication', 1, 950),
    ],
  },
  {
    invoiceId: 'INV-2026-0406',
    patientId: 'P-2026-1055',
    patientName: 'Mizanur Rahman',
    admissionId: 'ADM-2026-1166',
    admissionType: 'Emergency',
    ward: 'Cardiology',
    bed: 'CAR-105',
    periodStart: daysAgo(11),
    periodEnd: daysAgo(3),
    issuedAt: daysAgo(3, 12),
    status: 'pending',
    discount: 0,
    insuranceProviderId: 'INS-01',
    insuranceStatus: 'partially_approved',
    insuranceCoveredAmount: 55_000,
    paidAmount: 30_000,
    preparedBy: 'Rana Khan',
    lines: [
      line('CCU bed charge (per day)', 'room', 8, 7_200),
      line('Primary angioplasty (PTCA)', 'procedure', 1, 96_000),
      line('Inj. Enoxaparin', 'medication', 8, 1_850),
      line('Tab. Metoprolol 50 mg', 'medication', 16, 10),
      line('Cardiac enzymes panel', 'laboratory', 3, 2_400),
      line('Cath lab consumable set', 'consumable', 1, 8_600),
    ],
  },
  {
    invoiceId: 'INV-2026-0405',
    patientId: 'P-2026-1044',
    patientName: 'Kamrul Islam',
    admissionId: 'ADM-2026-1160',
    admissionType: 'Emergency',
    ward: 'ICU',
    bed: 'ICU-103',
    periodStart: daysAgo(14),
    periodEnd: daysAgo(6),
    issuedAt: daysAgo(6, 13),
    status: 'cancelled',
    discount: 0,
    insuranceStatus: 'self_pay',
    insuranceCoveredAmount: 0,
    paidAmount: 0,
    preparedBy: 'Rana Khan',
    lines: [
      line('ICU bed charge (per day)', 'room', 8, 8_500),
      line('Haemodialysis session', 'procedure', 4, 9_500),
      line('Inj. Erythropoietin', 'medication', 4, 3_200),
      line('Renal function panel', 'laboratory', 4, 1_750),
      line('Dialyser consumable set', 'consumable', 4, 4_100),
    ],
  },
  {
    invoiceId: 'INV-2026-0404',
    patientId: 'P-2026-1092',
    patientName: 'Rakibul Islam',
    admissionId: 'ADM-2026-1155',
    admissionType: 'Elective',
    ward: 'General Ward',
    bed: 'GEN-105',
    periodStart: daysAgo(5),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 16),
    status: 'draft',
    discount: 0,
    insuranceProviderId: 'INS-02',
    insuranceStatus: 'pending',
    insuranceCoveredAmount: 0,
    paidAmount: 0,
    preparedBy: 'Rana Khan',
    lines: [
      line('General ward bed charge (per day)', 'room', 5, 3_200),
      line('Hernia repair (mesh)', 'procedure', 1, 58_000),
      line('Tab. Napa 500 mg', 'medication', 15, 8),
      line('Cefradine 500 mg', 'medication', 15, 16),
      line('Ultrasound of abdomen', 'procedure', 1, 3_400),
      line('Routine blood panel', 'laboratory', 2, 1_300),
    ],
  },
  {
    invoiceId: 'INV-2026-0403',
    patientId: 'P-2026-1052',
    patientName: 'Jannatul Ferdous',
    admissionId: 'ADM-2026-1148',
    admissionType: 'Scheduled',
    ward: 'Cardiology',
    bed: 'CAR-102',
    periodStart: daysAgo(2),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 12),
    status: 'partially_paid',
    discount: 900,
    discountReason: 'Corporate scheme discount (demo)',
    insuranceProviderId: 'INS-03',
    insuranceStatus: 'pending',
    insuranceCoveredAmount: 0,
    paidAmount: 18_000,
    preparedBy: 'Rana Khan',
    lines: [
      line('Cardiology cabin charge (per day)', 'room', 2, 5_600),
      line('Echocardiogram', 'procedure', 1, 6_500),
      line('Holter monitoring (24 h)', 'procedure', 1, 8_200),
      line('Tab. Angilock 50 mg', 'medication', 10, 9),
      line('Thyroid profile', 'laboratory', 1, 2_400),
    ],
  },
  {
    invoiceId: 'INV-2026-0402',
    patientId: 'P-2026-1072',
    patientName: 'Mithila Rahman',
    admissionId: 'ADM-2026-1142',
    admissionType: 'Emergency',
    ward: 'Emergency',
    bed: 'EMG-103',
    periodStart: daysAgo(1),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 20),
    status: 'paid',
    discount: 0,
    insuranceProviderId: 'INS-05',
    insuranceStatus: 'approved',
    insuranceCoveredAmount: 4_590,
    paidAmount: 6_150,
    preparedBy: 'Rana Khan',
    lines: [
      line('Emergency bed charge (per day)', 'room', 1, 2_400),
      line('Nebulisation session', 'procedure', 3, 1_100),
      line('Inj. Hydrocortisone', 'medication', 3, 480),
      line('Chest X-ray', 'procedure', 1, 2_400),
      line('Pulse oximetry', 'service', 2, 600),
    ],
  },
  {
    invoiceId: 'INV-2026-0401',
    patientId: 'P-2026-1062',
    patientName: 'Sheuli Rani Pal',
    admissionId: 'ADM-2026-1138',
    admissionType: 'Transfer',
    ward: 'Neurology',
    bed: 'NEU-102',
    periodStart: daysAgo(7),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 10),
    status: 'pending',
    discount: 0,
    insuranceStatus: 'rejected',
    insuranceCoveredAmount: 0,
    paidAmount: 15_000,
    preparedBy: 'Rana Khan',
    lines: [
      line('Neurology ward bed charge (per day)', 'room', 7, 4_400),
      line('EEG study', 'procedure', 1, 7_800),
      line('Inj. Levetiracetam', 'medication', 10, 1_250),
      line('Tab. Losa 50 mg', 'medication', 20, 13),
      line('MRI of brain (plain)', 'procedure', 1, 18_000),
      line('Speech therapy session', 'service', 5, 1_100),
    ],
  },
  {
    invoiceId: 'INV-2026-0400',
    patientId: 'P-2026-1082',
    patientName: 'Babul Miah',
    admissionId: 'ADM-2026-1131',
    admissionType: 'Elective',
    ward: 'General Ward',
    bed: 'GEN-103',
    periodStart: daysAgo(2),
    periodEnd: daysAgo(0),
    issuedAt: daysAgo(0, 8),
    status: 'draft',
    discount: 0,
    insuranceStatus: 'self_pay',
    insuranceCoveredAmount: 0,
    paidAmount: 0,
    preparedBy: 'Rana Khan',
    lines: [
      line('General ward bed charge (per day)', 'room', 2, 3_200),
      line('Cataract surgery (phacoemulsification)', 'procedure', 1, 38_000),
      line('Eye drop Moxifloxacin', 'medication', 10, 120),
      line('Biometry', 'procedure', 1, 2_200),
      line('Post-operative review', 'service', 1, 900),
    ],
  },
  {
    invoiceId: 'INV-2026-0399',
    patientId: 'P-2026-1046',
    patientName: 'Abul Kalam Azad',
    admissionId: 'ADM-2026-1125',
    admissionType: 'Transfer',
    ward: 'ICU',
    bed: 'ICU-105',
    periodStart: daysAgo(19),
    periodEnd: daysAgo(12),
    issuedAt: daysAgo(12, 11),
    status: 'paid',
    discount: 3_000,
    discountReason: 'Long-stay welfare adjustment (demo)',
    insuranceProviderId: 'INS-04',
    insuranceStatus: 'approved',
    insuranceCoveredAmount: 74_000,
    paidAmount: 65_450,
    preparedBy: 'Rana Khan',
    lines: [
      line('ICU bed charge (per day)', 'room', 7, 8_500),
      line('Mechanical ventilation', 'service', 7, 4_200),
      line('Inj. Midazolam infusion', 'medication', 7, 2_100),
      line('Arterial blood gas', 'laboratory', 7, 1_800),
      line('Tracheostomy care kit', 'consumable', 7, 1_150),
      line('Specialist consultation (daily)', 'service', 7, 2_600),
    ],
  },
]

export const INSURANCE_CLAIMS: InsuranceClaim[] = [
  {
    claimId: 'CLM-2026-0418',
    invoiceId: 'INV-2026-0406',
    patientId: 'P-2026-1055',
    patientName: 'Mizanur Rahman',
    providerId: 'INS-01',
    providerName: 'Bangladesh Health Insurance Company Ltd.',
    amount: 184_360,
    approvedAmount: 55_000,
    submittedAt: daysAgo(2, 11),
    updatedAt: daysAgo(0, 10),
    status: 'approved',
    policyNumber: 'BHI-POL-774120',
    history: [
      { at: daysAgo(3, 9), status: 'draft', note: 'Claim drafted from the admission bill.', actor: 'Billing office' },
      { at: daysAgo(2, 11), status: 'submitted', note: 'Documents uploaded and submitted to the insurer.', actor: 'Billing office' },
      { at: daysAgo(1, 14), status: 'under_review', note: 'Insurer medical panel opened the file.', actor: 'BHI' },
      { at: daysAgo(0, 10), status: 'approved', note: 'Panel-approved amount recorded as a demo figure.', actor: 'BHI' },
    ],
  },
  {
    claimId: 'CLM-2026-0417',
    invoiceId: 'INV-2026-0409',
    patientId: 'P-2026-1061',
    patientName: 'Nur Mohammad',
    providerId: 'INS-04',
    providerName: 'Metropolitan Health Fund',
    amount: 71_322,
    approvedAmount: 46_322,
    submittedAt: daysAgo(4, 15),
    updatedAt: daysAgo(1, 12),
    status: 'paid',
    policyNumber: 'MHF-POL-331902',
    history: [
      { at: daysAgo(5, 10), status: 'draft', note: 'Claim drafted from the admission bill.', actor: 'Billing office' },
      { at: daysAgo(4, 15), status: 'submitted', note: 'Investigation reports attached and submitted.', actor: 'Billing office' },
      { at: daysAgo(3, 16), status: 'under_review', note: 'Awaiting insurer cost sheet verification.', actor: 'MHF' },
      { at: daysAgo(2, 11), status: 'approved', note: 'Approved for the covered panel.', actor: 'MHF' },
      { at: daysAgo(1, 12), status: 'paid', note: 'Settlement recorded against the demo ledger.', actor: 'Billing office' },
    ],
  },
  {
    claimId: 'CLM-2026-0416',
    invoiceId: 'INV-2026-0411',
    patientId: 'P-2026-1051',
    patientName: 'Kabir Chowdhury',
    providerId: 'INS-02',
    providerName: 'National Islami Insurance — Health',
    amount: 87_480,
    approvedAmount: 0,
    submittedAt: daysAgo(1, 16),
    updatedAt: daysAgo(0, 9),
    status: 'under_review',
    policyNumber: 'NII-POL-559043',
    history: [
      { at: daysAgo(2, 10), status: 'draft', note: 'Claim drafted with procedure and pharmacy detail.', actor: 'Billing office' },
      { at: daysAgo(1, 16), status: 'submitted', note: 'Submitted for pre-authorisation close-out.', actor: 'Billing office' },
      { at: daysAgo(0, 9), status: 'under_review', note: 'Insurer requested the angiography cost sheet. A ৳48,000 pre-authorised amount is already recorded on the invoice.', actor: 'NII' },
    ],
  },
  {
    claimId: 'CLM-2026-0415',
    invoiceId: 'INV-2026-0408',
    patientId: 'P-2026-1091',
    patientName: 'Samia Ahmed',
    providerId: 'INS-05',
    providerName: 'Sunrise Medicare Scheme',
    amount: 62_980,
    approvedAmount: 18_000,
    submittedAt: daysAgo(2, 14),
    updatedAt: daysAgo(0, 8),
    status: 'approved',
    policyNumber: 'SMS-POL-880461',
    history: [
      { at: daysAgo(3, 11), status: 'draft', note: 'Claim drafted after the procedure.', actor: 'Billing office' },
      { at: daysAgo(2, 14), status: 'submitted', note: 'Surgical notes and receipts attached.', actor: 'Billing office' },
      { at: daysAgo(1, 10), status: 'under_review', note: 'Under insurer review.', actor: 'SMS' },
      { at: daysAgo(0, 8), status: 'approved', note: 'Approved at the policy ceiling.', actor: 'SMS' },
    ],
  },
  {
    claimId: 'CLM-2026-0414',
    invoiceId: 'INV-2026-0412',
    patientId: 'P-2026-1042',
    patientName: 'Mohammad Rahman',
    providerId: 'INS-01',
    providerName: 'Bangladesh Health Insurance Company Ltd.',
    amount: 185_420,
    approvedAmount: 0,
    submittedAt: daysAgo(0, 12),
    updatedAt: daysAgo(0, 12),
    status: 'submitted',
    policyNumber: 'BHI-POL-901274',
    history: [
      { at: daysAgo(0, 11), status: 'draft', note: 'Claim drafted from the live admission bill.', actor: 'Billing office' },
      { at: daysAgo(0, 12), status: 'submitted', note: 'Submitted with provisional ICU documents.', actor: 'Billing office' },
    ],
  },
  {
    claimId: 'CLM-2026-0413',
    invoiceId: 'INV-2026-0401',
    patientId: 'P-2026-1062',
    patientName: 'Sheuli Rani Pal',
    providerId: 'INS-03',
    providerName: 'Delta Life Insurance Company',
    amount: 74_860,
    approvedAmount: 0,
    submittedAt: daysAgo(6, 13),
    updatedAt: daysAgo(3, 11),
    status: 'rejected',
    policyNumber: 'DLI-POL-220815',
    rejectionReason: 'Pre-existing condition exclusion (fictional demo outcome).',
    history: [
      { at: daysAgo(7, 10), status: 'draft', note: 'Claim drafted from the admission bill.', actor: 'Billing office' },
      { at: daysAgo(6, 13), status: 'submitted', note: 'Submitted with imaging reports.', actor: 'Billing office' },
      { at: daysAgo(5, 12), status: 'under_review', note: 'Insurer medical panel review started.', actor: 'DLI' },
      { at: daysAgo(3, 11), status: 'rejected', note: 'Rejected under the pre-existing condition clause (demo).', actor: 'DLI' },
    ],
  },
  {
    claimId: 'CLM-2026-0412',
    invoiceId: 'INV-2026-0404',
    patientId: 'P-2026-1092',
    patientName: 'Rakibul Islam',
    providerId: 'INS-02',
    providerName: 'National Islami Insurance — Health',
    amount: 80_360,
    approvedAmount: 0,
    submittedAt: daysAgo(1, 9),
    updatedAt: daysAgo(0, 15),
    status: 'under_review',
    policyNumber: 'NII-POL-663190',
    history: [
      { at: daysAgo(2, 12), status: 'draft', note: 'Claim drafted while the invoice is still provisional.', actor: 'Billing office' },
      { at: daysAgo(1, 9), status: 'submitted', note: 'Submitted with the operative note.', actor: 'Billing office' },
      { at: daysAgo(0, 15), status: 'under_review', note: 'Awaiting the insurer utilisation report.', actor: 'NII' },
    ],
  },
  {
    claimId: 'CLM-2026-0411',
    invoiceId: 'INV-2026-0399',
    patientId: 'P-2026-1046',
    patientName: 'Abul Kalam Azad',
    providerId: 'INS-04',
    providerName: 'Metropolitan Health Fund',
    amount: 139_450,
    approvedAmount: 74_000,
    submittedAt: daysAgo(11, 10),
    updatedAt: daysAgo(2, 13),
    status: 'paid',
    policyNumber: 'MHF-POL-118930',
    history: [
      { at: daysAgo(11, 10), status: 'draft', note: 'Claim drafted for the long-stay admission.', actor: 'Billing office' },
      { at: daysAgo(9, 12), status: 'submitted', note: 'Ventilation chart and tracheostomy records attached.', actor: 'Billing office' },
      { at: daysAgo(6, 15), status: 'under_review', note: 'Insurer cost sheet verification in progress.', actor: 'MHF' },
      { at: daysAgo(4, 11), status: 'approved', note: 'Panel approved ৳74,000 of the ৳139,450 claim.', actor: 'MHF' },
      { at: daysAgo(2, 13), status: 'paid', note: 'Settlement credited to the demo ledger.', actor: 'Billing office' },
    ],
  },
]

assertLedgerIsConsistent(BILLING_INVOICES, INSURANCE_CLAIMS)
