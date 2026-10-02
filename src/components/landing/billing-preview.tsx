import { LandingSection } from '@/components/landing/section'
import { PreviewFrame } from '@/components/landing/preview-frame'
import { PreviewPanel } from '@/components/landing/preview-panel'
import { SectionHeader } from '@/components/common/section-header'
import { StatusBadge } from '@/components/common/status-badge'
import {
  billingLines,
  billingSummary,
  dischargePreview,
  moduleCapabilities,
} from '@/data/mock/landing-previews'

export function BillingPreview() {
  return (
    <LandingSection id="billing">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeader
            kicker="Billing & discharge"
            title="Itemized bills, tracked claims, digital discharge"
            description="Costs are itemized and insurance claims are tracked from submission to approval, while discharge produces a structured summary for the patient and family."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {moduleCapabilities.billing.map((capability) => (
              <li
                key={capability}
                className="rounded-lg border bg-card px-4 py-3 text-sm shadow-card"
              >
                {capability}
              </li>
            ))}
          </ul>
        </div>

        <PreviewFrame label="CareGrid.io · Billing & discharge">
          <div className="space-y-3">
            <PreviewPanel
              title="Itemized invoice"
              action={
                <StatusBadge
                  tone={billingSummary.claimTone}
                  label={`Claim ${billingSummary.claimStatus}`}
                />
              }
            >
              <dl className="space-y-2">
                {billingLines.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <div>
                      <p className="font-medium">{line.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {line.category}
                      </p>
                    </div>
                    <p className="tabular-nums">BDT {line.amount}</p>
                  </div>
                ))}
                <div className="my-2 border-t" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">BDT {billingSummary.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Insurance · {billingSummary.insuranceProvider}
                  </span>
                  <span className="tabular-nums">
                    − BDT {billingSummary.insurance}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Payable by patient</span>
                  <span className="tabular-nums">
                    BDT {billingSummary.final}
                  </span>
                </div>
              </dl>
            </PreviewPanel>

            <PreviewPanel
              title="Digital discharge summary"
              action={<StatusBadge tone="info" label="Ready" />}
            >
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Patient</dt>
                  <dd className="text-sm font-medium">
                    {dischargePreview.patient}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Diagnosis</dt>
                  <dd className="text-sm">{dischargePreview.diagnosis}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Medications
                  </dt>
                  <dd className="text-sm">{dischargePreview.medications}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Follow-up</dt>
                  <dd className="text-sm">{dischargePreview.followUp}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  {dischargePreview.signedBy}
                </p>
                <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                  Share with family
                </span>
              </div>
            </PreviewPanel>
          </div>
        </PreviewFrame>
      </div>
    </LandingSection>
  )
}