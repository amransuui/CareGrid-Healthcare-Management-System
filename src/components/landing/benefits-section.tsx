import { Check } from 'lucide-react'
import { LandingSection } from '@/components/landing/section'
import { SectionHeader } from '@/components/common/section-header'
import { benefits } from '@/data/mock/landing-previews'

export function BenefitsSection() {
  return (
    <LandingSection aria-label="Who it helps">
      <SectionHeader
        align="center"
        kicker="Outcomes"
        title="Built for the teams that depend on each other"
        description="CareGrid.io brings value across the clinical and operational teams that collaborate on every patient journey."
      />
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit.audience}
            className="rounded-xl border bg-card p-6 shadow-card"
          >
            <h3 className="text-sm font-semibold">{benefit.audience}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {benefit.description}
            </p>
            <ul className="mt-4 space-y-2">
              {benefit.points.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm">
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}