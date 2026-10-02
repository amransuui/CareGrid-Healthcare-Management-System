import { CircleAlert } from 'lucide-react'
import { LandingSection } from '@/components/landing/section'
import { SectionHeader } from '@/components/common/section-header'
import { problemFragments } from '@/data/mock/landing-previews'

export function ProblemSection() {
  return (
    <LandingSection id="problem">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            kicker="The challenge"
            title="Hospital operations today run on fragments"
            description="Without a shared operational view, critical coordination happens through separate systems, phone calls and paper — and every handoff is a point of risk."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {problemFragments.map((fragment) => (
            <div
              key={fragment.title}
              className="rounded-xl border bg-card p-4 shadow-card"
            >
              <div className="flex items-start gap-3">
                <CircleAlert
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-semibold">{fragment.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {fragment.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  )
}