import { Siren } from 'lucide-react'
import { LandingSection } from '@/components/landing/section'
import { PreviewFrame } from '@/components/landing/preview-frame'
import { PreviewKpi } from '@/components/landing/preview-kpi'
import { PreviewPanel } from '@/components/landing/preview-panel'
import { SectionHeader } from '@/components/common/section-header'
import { StatusBadge } from '@/components/common/status-badge'
import {
  bloodComponents,
  bloodInventory,
  bloodSummary,
  moduleCapabilities,
  sosWorkflow,
} from '@/data/mock/landing-previews'

export function BloodBankPreview() {
  return (
    <LandingSection id="blood" className="bg-muted/30">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:order-2">
          <SectionHeader
            kicker="Blood & donors"
            title="From inventory to emergency SOS"
            description="Group- and component-level stock with expiry awareness, a living donor registry, and a broadcast flow for urgent requests — so the right blood is never hard to find."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {moduleCapabilities.blood.map((capability) => (
              <li
                key={capability}
                className="rounded-lg border bg-card px-4 py-3 text-sm shadow-card"
              >
                {capability}
              </li>
            ))}
          </ul>
        </div>

        <PreviewFrame label="CareGrid.io · Smart blood bank" className="lg:order-1">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {bloodSummary.map((item) => (
                <PreviewKpi
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>

            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">
                        Group
                      </th>
                      {bloodComponents.map((component) => (
                        <th
                          key={component}
                          className="px-3 py-2 text-right font-medium"
                        >
                          {component}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-right font-medium">
                        Expiring
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodInventory.map((row) => (
                      <tr
                        key={row.group}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-start gap-1.5">
                            <span className="font-semibold">{row.group}</span>
                            {row.critical ? (
                              <StatusBadge tone="critical" label="Low" />
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {row.whole}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {row.rbc}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {row.platelets}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {row.plasma}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.expiring > 0 ? (
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                              {row.expiring}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <PreviewPanel
              title="Emergency SOS flow"
              action={
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <Siren className="size-3.5" aria-hidden="true" />
                  Request #SOS-104
                </span>
              }
            >
              <ol className="grid gap-2 sm:grid-cols-2">
                {sosWorkflow.map((step) => (
                  <li
                    key={step.step}
                    className="rounded-lg border bg-background p-3"
                  >
                    <p className="text-xs font-semibold text-primary">
                      {step.step}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </PreviewPanel>
          </div>
        </PreviewFrame>
      </div>
    </LandingSection>
  )
}