import { KeyRound, ScrollText, ShieldCheck } from 'lucide-react'
import { LandingSection } from '@/components/landing/section'
import { SectionHeader } from '@/components/common/section-header'

const securityPoints = [
  {
    title: 'Role-scoped access',
    description:
      'Each user sees only the workspaces and data their role requires.',
    icon: KeyRound,
  },
  {
    title: 'Activity records',
    description:
      'Significant actions are recorded with time, user and context for later review.',
    icon: ScrollText,
  },
  {
    title: 'Isolated demo data',
    description:
      'All preview and demo information on this site is fictional and non-identifiable.',
    icon: ShieldCheck,
  },
] as const

export function SecuritySection() {
  return (
    <LandingSection id="security" className="bg-muted/30">
      <SectionHeader
        align="center"
        kicker="Security"
        title="Designed around responsible access"
        description="Access is controlled, activity is reviewable, and the data shown anywhere on this site is fictional demo data."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {securityPoints.map((point) => (
          <div
            key={point.title}
            className="rounded-xl border bg-card p-6 text-center shadow-card"
          >
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <point.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-sm font-semibold">{point.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {point.description}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}