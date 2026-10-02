import {
  BenefitsSection,
  BillingPreview,
  BloodBankPreview,
  FinalCta,
  HeroSection,
  HowItWorks,
  ModuleShowcase,
  OperationsPreview,
  OrganMatchingPreview,
  PatientExperienceSection,
  PrescriptionPreview,
  ProblemSection,
  RoleAccess,
  SecuritySection,
  SolutionSection,
  ValueStrip,
} from '@/components/landing'

/**
 * Professional public landing page. Sections are assembled from
 * `src/components/landing`; every product preview reads fictional demo
 * data from `src/data/mock/landing-previews` (never inline).
 */
export function LandingPage() {
  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <HeroSection />
      <ValueStrip />
      <ProblemSection />
      <SolutionSection />
      <ModuleShowcase />
      <OrganMatchingPreview />
      <BloodBankPreview />
      <PatientExperienceSection />
      <PrescriptionPreview />
      <BillingPreview />
      <OperationsPreview />
      <HowItWorks />
      <RoleAccess />
      <SecuritySection />
      <BenefitsSection />
      <FinalCta />
    </div>
  )
}