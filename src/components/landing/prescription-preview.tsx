import { AlertCircle } from 'lucide-react'
import { LandingSection } from '@/components/landing/section'
import { PreviewFrame } from '@/components/landing/preview-frame'
import { PreviewPanel } from '@/components/landing/preview-panel'
import { SectionHeader } from '@/components/common/section-header'
import { StatusBadge } from '@/components/common/status-badge'
import { cn } from 'cn'
import {
  moduleCapabilities,
  patientPreview,
  prescriptionLines,
  prescriptionSteps,
  prescriptionWarnings,
} from '@/data/mock/landing-previews'

const prescriptionCapabilities = [...moduleCapabilities.prescription]

export function PrescriptionPreview() {
  return (
    <LandingSection id="pharmacy" className="bg-muted/30">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeader
            kicker="E-prescription & pharmacy"
            title="Medication safety before the pharmacy queue"
            description="Prescriptions capture patient context, medication lines and built-in safety checks — allergy, interaction and duplicate warnings surface before the order is handed to pharmacy."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {prescriptionCapabilities.map((capability) => (
              <li
                key={capability}
                className="rounded-lg border bg-card px-4 py-3 text-sm shadow-card"
              >
                {capability}
              </li>
            ))}
          </ul>
        </div>

        <PreviewFrame
          label="CareGrid.io · E-prescription"
          className="lg:order-1"
        >
          <div className="space-y-3">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {patientPreview.name} · {patientPreview.mrn}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {patientPreview.condition}
                  </p>
                </div>
                <StatusBadge tone="warning" label="Awaiting pharmacist" />
              </div>
              <ol className="mt-4 flex flex-wrap items-center gap-2">
                {prescriptionSteps.map((step, index) => (
                  <li key={step.label} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-md border px-2 py-1 text-xs font-medium',
                        index <= 2
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {index + 1}. {step.label}
                    </span>
                    {index < prescriptionSteps.length - 1 ? (
                      <span
                        className="text-xs text-muted-foreground"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>

            <PreviewPanel title="Safety checks">
              <ul className="space-y-2">
                {prescriptionWarnings.map((warning) => (
                  <li
                    key={warning.title}
                    className="flex items-start gap-2.5 rounded-md border bg-background px-3 py-2"
                  >
                    <AlertCircle
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        warning.tone === 'critical'
                          ? 'text-destructive'
                          : 'text-amber-600 dark:text-amber-400',
                      )}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {warning.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {warning.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </PreviewPanel>

            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">
                        Medication
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Dose
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Frequency
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionLines.map((line) => (
                      <tr
                        key={line.medicine}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-3 py-2">
                          <p className="font-medium">{line.medicine}</p>
                          <p className="text-muted-foreground">{line.note}</p>
                        </td>
                        <td className="px-3 py-2">{line.dosage}</td>
                        <td className="px-3 py-2">{line.frequency}</td>
                        <td className="px-3 py-2">{line.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </PreviewFrame>
      </div>
    </LandingSection>
  )
}