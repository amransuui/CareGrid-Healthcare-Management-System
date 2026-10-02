export const siteConfig = {
  name: 'CareGrid.io',
  title:
    'A Unified Digital Platform for Hospital Care, Blood & Organ Coordination',
  tagline: 'One Platform. Connected Care.',
  description:
    'CareGrid.io unifies hospital care, blood supply management, and organ donation coordination into one precise, secure operations platform.',
  statusLabel: 'All systems operational',
} as const

export type SiteConfig = typeof siteConfig