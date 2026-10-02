import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BedDouble,
  Bell,
  Boxes,
  ClipboardPlus,
  Droplets,
  FileCheck2,
  HandHeart,
  HeartHandshake,
  HeartPulse,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Pill,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldAlert,
  Siren,
  Timer,
  Users,
  UsersRound,
} from 'lucide-react'
import type { StatusTone } from '@/components/common/status-badge'
import type { UserRole } from '@/types/auth'

/**
 * Single source of truth for the authenticated application navigation.
 * Both the sidebar, mobile drawer, breadcrumbs and global search read from
 * this config so labels and routes stay in sync.
 */

export type AppNavGroupId =
  | 'overview'
  | 'clinical'
  | 'organ'
  | 'blood'
  | 'pharmacy'
  | 'financial'
  | 'system'

export interface AppNavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Optional trailing pill, e.g. the Emergency SOS marker. */
  badge?: string
  badgeTone?: StatusTone
  /**
   * Roles that may see this item. Omit to show for every role. Family
   * accounts are filtered down to the overview + notifications in the
   * role-aware navigation helper.
   */
  roles?: UserRole[]
}

export interface AppNavGroup {
  id: AppNavGroupId
  label: string
  items: AppNavItem[]
}

/**
 * Every staff-facing clinical/operational role. Family accounts are never
 * granted these navigation entries.
 */
export const STAFF_ROLES: UserRole[] = [
  'doctor',
  'nurse',
  'blood_bank_coordinator',
  'pharmacist',
  'billing_officer',
]

export const appNavigation: AppNavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
      { label: 'Family Portal', href: '/app/family', icon: HandHeart },
    ],
  },
  {
    id: 'clinical',
    label: 'Clinical',
    items: [
      { label: 'Patients', href: '/app/patients', icon: Users, roles: STAFF_ROLES },
      { label: 'Vitals', href: '/app/vitals', icon: Activity, roles: STAFF_ROLES },
      { label: 'Wards & Beds', href: '/app/wards', icon: BedDouble, roles: STAFF_ROLES },
    ],
  },
  {
    id: 'organ',
    label: 'Organ Care',
    items: [
      { label: 'Organ Matching', href: '/app/organ/matching', icon: HeartPulse, roles: STAFF_ROLES },
      { label: 'Waiting List', href: '/app/organ/waiting-list', icon: ListChecks, roles: STAFF_ROLES },
      { label: 'Ischemia', href: '/app/organ/ischemia', icon: Timer, roles: STAFF_ROLES },
      { label: 'Living Donors', href: '/app/organ/living-donors', icon: HeartHandshake, roles: STAFF_ROLES },
    ],
  },
  {
    id: 'blood',
    label: 'Blood Bank',
    items: [
      { label: 'Inventory', href: '/app/blood/inventory', icon: Droplets, roles: STAFF_ROLES },
      { label: 'Donors', href: '/app/blood/donors', icon: UsersRound, roles: STAFF_ROLES },
      { label: 'Requests', href: '/app/blood/requests', icon: Bell, roles: STAFF_ROLES },
      {
        label: 'Emergency SOS',
        href: '/app/blood/sos',
        icon: Siren,
        badge: 'SOS',
        badgeTone: 'critical',
        roles: STAFF_ROLES,
      },
    ],
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    items: [
      { label: 'Overview', href: '/app/pharmacy', icon: Boxes, roles: STAFF_ROLES },
      { label: 'Prescriptions', href: '/app/pharmacy/prescriptions', icon: ClipboardPlus, roles: STAFF_ROLES },
      { label: 'Inventory', href: '/app/pharmacy/inventory', icon: Pill, roles: STAFF_ROLES },
      { label: 'Safety Alerts', href: '/app/pharmacy/alerts', icon: ShieldAlert, roles: STAFF_ROLES },
    ],
  },
  {
    id: 'financial',
    label: 'Financial',
    items: [
      { label: 'Billing', href: '/app/billing', icon: ReceiptText, roles: STAFF_ROLES },
      { label: 'Invoices', href: '/app/billing/invoices', icon: ScrollText, roles: STAFF_ROLES },
      { label: 'Claims', href: '/app/billing/claims', icon: Landmark, roles: STAFF_ROLES },
      { label: 'Discharge', href: '/app/discharge', icon: FileCheck2, roles: STAFF_ROLES },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { label: 'Notifications', href: '/app/notifications', icon: Bell },
      { label: 'Settings', href: '/app/settings', icon: Settings, roles: STAFF_ROLES },
    ],
  },
]

/** Navigation visible to a given role. Family accounts see overview + notifications only. */
export function navigationForRole(role: UserRole | undefined): AppNavGroup[] {
  const groups: AppNavGroup[] = []
  for (const group of appNavigation) {
    const items = group.items.filter(
      (item) => !item.roles?.length || (role ? item.roles.includes(role) : true),
    )
    if (items.length) groups.push({ ...group, items })
  }
  return groups
}

export interface AppNavMatch {
  group: AppNavGroup
  item: AppNavItem
}

/** Resolve a route path to its navigation section and item, if any. */
export function findAppNavItem(pathname: string): AppNavMatch | null {
  let best: AppNavMatch | null = null
  for (const group of appNavigation) {
    for (const item of group.items) {
      const isExact = item.href === pathname
      const isAncestor =
        item.href !== '/app/dashboard' && pathname.startsWith(`${item.href}/`)
      if (!isExact && !isAncestor) continue
      // Prefer the most specific href so `/app/billing/invoices` resolves to
      // Invoices rather than its ancestor Billing entry.
      if (!best || item.href.length > best.item.href.length) best = { group, item }
    }
  }
  return best
}

/** Exact-and-subtree match for highlighting paginated detail routes. */
export function isAppNavItemActive(item: AppNavItem, pathname: string): boolean {
  if (item.href === pathname) return true
  return pathname.startsWith(`${item.href}/`)
}

export const flattenedAppNavItems: AppNavItem[] = appNavigation.flatMap(
  (group) => group.items,
)