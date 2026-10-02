import { LandingSection } from '@/components/landing/section'
import { PreviewFrame } from '@/components/landing/preview-frame'
import { PreviewKpi } from '@/components/landing/preview-kpi'
import { PreviewPanel } from '@/components/landing/preview-panel'
import { SectionHeader } from '@/components/common/section-header'
import { StatusBadge } from '@/components/common/status-badge'
import {
  moduleCapabilities,
  patientPreview,
} from '@/data/mock/landing-previews'

export function PatientExperienceSection() {
  return (
    <LandingSection id="patients">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeader
            kicker="Patient & family"
            title="Every patient, ward and family in view"
            description="A shared patient record, live ward and bed status, and read-only family access keep everyone — clinical and otherwise — on the same page."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {moduleCapabilities.patient.map((capability) => (
              <li
                key={capability}
                className="rounded-lg border bg-card px-4 py-3 text-sm shadow-card"
              >
                {capability}
              </li>
            ))}
          </ul>
        </div>

        <PreviewFrame label="CareGrid.io · Patient overview">
          <div className="space-y-3">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    AR
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {patientPreview.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patientPreview.condition}
                    </p>
                  </div>
                </div>
                <StatusBadge tone="info" label="Admitted" />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Ward</dt>
                  <dd className="font-medium">{patientPreview.ward}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Bed</dt>
                  <dd className="font-medium">{patientPreview.bed}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Doctor</dt>
                  <dd className="font-medium">{patientPreview.doctor}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Admitted</dt>
                  <dd className="font-medium">{patientPreview.admitted}</dd>
                </div>
              </dl>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {patientPreview.vitals.map((vital) => (
                <PreviewKpi
                  key={vital.label}
                  label={vital.label}
                  value={vital.value}
                />
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PreviewPanel title="Care timeline">
                <ol className="space-y-0">
                  {patientPreview.timeline.map((entry, index) => (
                    <li
                      key={entry.time}
                      className="relative flex gap-3 pb-3 last:pb-0"
                    >
                      {index < patientPreview.timeline.length - 1 ? (
                        <span
                          className="absolute top-3 left-[3px] h-full w-px bg-border"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-xs font-medium tabular-nums">
                          {entry.time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.event}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </PreviewPanel>

              <PreviewPanel title="Active medications">
                <ul className="space-y-2">
                  {patientPreview.medications.map((medication) => (
                    <li
                      key={medication.name}
                      className="rounded-md border bg-background px-3 py-2"
                    >
                      <p className="text-xs font-medium">{medication.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {medication.schedule}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1.5">
                  {patientPreview.alerts.map((alert) => (
                    <div
                      key={alert.text}
                      className="flex items-start gap-1.5"
                    >
                      <StatusBadge tone={alert.tone} label="Info" />
                      <span className="text-xs text-muted-foreground">
                        {alert.text}
                      </span>
                    </div>
                  ))}
                </div>
              </PreviewPanel>
            </div>
          </div>
        </PreviewFrame>
      </div>
    </LandingSection>
  )
}