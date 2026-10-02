import { CheckCircle2 } from 'lucide-react'
import { LandingSection } from '@/components/landing/section'
import { valuePoints } from '@/data/mock/landing-previews'

export function ValueStrip() {
  return (
    <LandingSection aria-label="Why CareGrid.io" className="pt-6 pb-0 sm:pt-8">
      <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        {valuePoints.map((point) => (
          <div key={point.title} className="flex gap-3">
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-sm font-semibold">{point.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}