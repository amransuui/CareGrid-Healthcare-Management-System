import { LandingSection } from '@/components/landing/section'
import { SectionHeader } from '@/components/common/section-header'
import { howItWorks } from '@/data/mock/landing-previews'

export function HowItWorks() {
  return (
    <LandingSection aria-label="How it works">
      <SectionHeader
        align="center"
        kicker="How it works"
        title="A connected flow, from connect to act"
        description="CareGrid.io replaces fragmented handoffs with a single operational loop."
      />
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {howItWorks.map((step) => (
          <li
            key={step.step}
            className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-card"
          >
            <span className="text-xs font-semibold tracking-widest text-primary">
              {step.step}
            </span>
            <h3 className="text-sm font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </LandingSection>
  )
}