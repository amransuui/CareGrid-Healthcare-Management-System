import { LandingSection } from '@/components/landing/section'
import { SectionHeader } from '@/components/common/section-header'
import { roles } from '@/data/mock/landing-previews'

export function RoleAccess() {
  return (
    <LandingSection id="solutions">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeader
            kicker="Role-based workspaces"
            title="Every role sees what's relevant"
            description="Doctors, nurses, blood bank coordinators, pharmacists, billing officers and families each get a workspace shaped around the tasks they own — no noise, no duplicates."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <div key={role.title} className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="text-sm font-semibold">{role.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  )
}