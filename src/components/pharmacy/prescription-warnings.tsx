import { ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { WarningSeverityBadge, WarningTypeBadge } from '@/components/pharmacy/pharmacy-status-badges'
import type { PrescriptionWarning } from '@/types/pharmacy'

interface PrescriptionWarningsProps {
  warnings: PrescriptionWarning[]
}

/** Simulated safety flags for a prescription — review before dispensing. */
export function PrescriptionWarnings({ warnings }: PrescriptionWarningsProps) {
  if (warnings.length === 0) {
    return (
      <Alert
        variant="default"
        className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5"
      >
        <ShieldCheck
          aria-hidden="true"
          className="size-4 text-emerald-600 dark:text-emerald-400"
        />
        <AlertTitle className="text-emerald-700 dark:text-emerald-400">No safety flags</AlertTitle>
        <AlertDescription className="text-emerald-700/80 dark:text-emerald-400/80">
          Medication check found no allergy, interaction or duplicate warnings on this prescription.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-2">
      {warnings.map((warning, index) => (
        <Alert key={index} variant="default">
          <div className="flex flex-wrap items-center gap-2">
            <WarningTypeBadge type={warning.type} />
            <WarningSeverityBadge severity={warning.severity} />
            {warning.medication ? (
              <p className="text-sm font-medium">{warning.medication}</p>
            ) : null}
          </div>
          <AlertTitle className="sr-only">
            {warning.type} warning{warning.medication ? ` for ${warning.medication}` : ''}
          </AlertTitle>
          <AlertDescription className="pt-1 text-sm text-muted-foreground">
            {warning.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}