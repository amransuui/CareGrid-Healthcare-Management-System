import {
  ArrowUpRight,
  BedDouble,
  ClipboardList,
  Droplets,
  HandHeart,
  HeartPulse,
  Pill,
  ReceiptText,
  Siren,
  Timer,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { LandingSection } from '@/components/landing/section'
import { SectionHeader } from '@/components/common/section-header'

interface ModuleCard {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

const modules: ModuleCard[] = [
  {
    title: 'Patient management',
    href: '/#patients',
    description: 'Profiles, vitals, timeline and care context.',
    icon: Users,
  },
  {
    title: 'Ward & bed management',
    href: '/#patients',
    description: 'Live bed status and ward occupancy.',
    icon: BedDouble,
  },
  {
    title: 'Family portal',
    href: '/#patients',
    description: 'Read-only visibility for family members.',
    icon: HandHeart,
  },
  {
    title: 'Organ matching',
    href: '/#organ',
    description: 'Compatibility scoring and transplant context.',
    icon: HeartPulse,
  },
  {
    title: 'Waiting list & ischemia',
    href: '/#organ',
    description: 'Priority queue and organ viability timers.',
    icon: Timer,
  },
  {
    title: 'Smart blood bank',
    href: '/#blood',
    description: 'Group, component and expiry-aware inventory.',
    icon: Droplets,
  },
  {
    title: 'Donor management',
    href: '/#blood',
    description: 'Donor registry and eligibility tracking.',
    icon: HandHeart,
  },
  {
    title: 'Emergency blood SOS',
    href: '/#blood',
    description: 'Urgent requests routed and broadcast across the network.',
    icon: Siren,
  },
  {
    title: 'E-prescription',
    href: '/#pharmacy',
    description: 'Medication orders with built-in safety checks.',
    icon: ClipboardList,
  },
  {
    title: 'Pharmacy inventory',
    href: '/#pharmacy',
    description: 'Stock levels and low-stock visibility.',
    icon: Pill,
  },
  {
    title: 'Billing & insurance claims',
    href: '/#billing',
    description: 'Itemized invoices and claim tracking.',
    icon: ReceiptText,
  },
  {
    title: 'Digital discharge',
    href: '/#billing',
    description: 'Structured summaries from stay to follow-up.',
    icon: ClipboardList,
  },
]

export function ModuleShowcase() {
  return (
    <LandingSection id="modules">
      <SectionHeader
        align="center"
        kicker="The platform"
        title="Every critical workflow sees the same picture"
        description="A connected set of modules covering the full patient journey — from admission and organ and blood coordination to prescriptions, billing and discharge."
      />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.title}
            to={module.href}
            className="group flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex size-9 items-center justify-center rounded-md bg-muted text-primary">
                <module.icon className="size-4.5" aria-hidden="true" />
              </span>
              <ArrowUpRight
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{module.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {module.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </LandingSection>
  )
}