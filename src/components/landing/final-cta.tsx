import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LandingSection } from '@/components/landing/section'
import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'

export function FinalCta() {
  return (
    <LandingSection id="contact" className="pb-20 sm:pb-24">
      <div className="rounded-2xl border bg-card px-6 py-12 text-center shadow-card sm:px-12">
        <SectionHeader
          align="center"
          kicker="Get started"
          title="Ready to connect your care operations?"
          description="Create a role-based workspace or explore the platform using the previews above."
        />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/register">
              Create Account
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Auth is under development — these buttons are placeholders for now.
        </p>
      </div>
    </LandingSection>
  )
}