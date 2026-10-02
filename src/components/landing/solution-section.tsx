import { ArrowRight, Check, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LandingSection } from '@/components/landing/section'
import { PreviewFrame } from '@/components/landing/preview-frame'
import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import { connectedFlow } from '@/data/mock/landing-previews'

export function SolutionSection() {
  return (
    <LandingSection id="about" className="bg-muted/30">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeader
            kicker="The CareGrid approach"
            title="One connected platform for clinical operations"
            description="Instead of separate tools for every department, CareGrid.io connects patients, clinical care, blood, organs, pharmacy and billing into a single operational picture."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {connectedFlow.map((flow) => (
              <li key={flow.label} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  aria-hidden="true"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{flow.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {flow.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button asChild>
              <Link to="/#modules">
                See what's inside
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <PreviewFrame label="CareGrid.io · One connected view">
          <div className="space-y-3">
            {connectedFlow.map((flow, index) => (
              <div
                key={flow.label}
                className="flex items-center gap-3 rounded-lg border bg-background p-3"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                  aria-hidden="true"
                >
                  <Network className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{flow.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {flow.description}
                  </p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  Flow {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </PreviewFrame>
      </div>
    </LandingSection>
  )
}