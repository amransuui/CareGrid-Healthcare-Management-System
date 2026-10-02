import type {
  MedicineStockStatus,
  PharmacyMedicine,
  PrescriptionMedication,
  PrescriptionWarning,
} from '@/types/pharmacy'

/** Whole days between today and the expiry date (negative once expired). */
export function daysUntilExpiry(expiryDate: string): number {
  const target = new Date(expiryDate)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}

export function medicineStockStatus(medicine: PharmacyMedicine): MedicineStockStatus {
  if (medicine.stock <= 0) return 'out_of_stock'
  if (daysUntilExpiry(medicine.expiryDate) <= 30) return 'expiring_soon'
  if (medicine.stock <= medicine.reorderLevel) return 'low_stock'
  return 'in_stock'
}

export const MEDICINE_STOCK_TONE: Record<
  MedicineStockStatus,
  'success' | 'warning' | 'critical' | 'info'
> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'critical',
  expiring_soon: 'warning',
}

interface InteractionRule {
  drugs: [string, string]
  severity: PrescriptionWarning['severity']
  message: string
}

const INTERACTION_RULES: InteractionRule[] = [
  {
    drugs: ['metoprolol', 'amlodipine'],
    severity: 'medium',
    message: 'Possible additive hypotensive effect — monitor blood pressure during therapy.',
  },
  {
    drugs: ['rivaroxaban', 'aspirin'],
    severity: 'high',
    message: 'Increased bleeding risk when combined — review the anticoagulation plan.',
  },
  {
    drugs: ['warfarin', 'aspirin'],
    severity: 'high',
    message: 'Increased bleeding risk when combined — review the anticoagulation plan.',
  },
  {
    drugs: ['metformin', 'insulin'],
    severity: 'medium',
    message: 'Combined glucose-lowering therapy — monitor for hypoglycaemia.',
  },
]

const ALLERGY_GROUPS: { allergy: string; pattern: RegExp; severity: PrescriptionWarning['severity'] }[] = [
  { allergy: 'Penicillin', pattern: /penicillin|amoxiclav|amoxicillin|ampicillin/i, severity: 'high' },
  { allergy: 'NSAIDs', pattern: /ibuprofen|naproxen|diclofenac|aspirin|ketorolac/i, severity: 'high' },
  { allergy: 'Sulfa drugs', pattern: /sulfamethoxazole|sulfasalazine|sulfadiazine/i, severity: 'high' },
  { allergy: 'Cephalosporins', pattern: /cefalexin|cefixime|ceftriaxone|cefuroxime/i, severity: 'medium' },
]

/**
 * Deterministic demo safety check run when a prescription is created. Real
 * screening lives in the backend; this mirrors the future API contract.
 */
export function buildPrescriptionWarnings(
  medications: PrescriptionMedication[],
  patientAllergies: string[],
): PrescriptionWarning[] {
  const warnings: PrescriptionWarning[] = []
  const names = medications.map((med) => med.medication)

  const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
  for (const duplicate of [...new Set(duplicates)]) {
    warnings.push({
      type: 'duplicate',
      severity: 'low',
      medication: duplicate,
      message: `${duplicate} appears more than once on this prescription — confirm the intended dosage.`,
    })
  }

  for (const med of medications) {
    for (const rule of ALLERGY_GROUPS) {
      if (patientAllergies.includes(rule.allergy) && rule.pattern.test(med.medication)) {
        warnings.push({
          type: 'allergy',
          severity: rule.severity,
          medication: med.medication,
          message: `${rule.allergy} allergy is recorded for this patient — cross-check before prescribing or dispensing.`,
        })
      }
    }
  }

  const lowercase = medications.map((med) => med.medication.toLowerCase())
  for (const rule of INTERACTION_RULES) {
    const [first, second] = rule.drugs
    if (lowercase.some((name) => name.includes(first)) && lowercase.some((name) => name.includes(second))) {
      warnings.push({ type: 'interaction', severity: rule.severity, message: rule.message })
    }
  }

  return warnings
}

export function formatQuantity(quantity: number): string {
  return `${quantity} units`
}

export function formatExpiry(expiryDate: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(expiryDate),
  )
}