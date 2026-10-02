export interface HeaderLinkItem {
  type: 'link'
  label: string
  href: string
}

export interface HeaderGroupItem {
  type: 'group'
  label: string
  items: { label: string; href: string; description: string }[]
}

export type HeaderNavItem = HeaderLinkItem | HeaderGroupItem

export const headerNav: HeaderNavItem[] = [
  {
    type: 'group',
    label: 'Product',
    items: [
      {
        label: 'Patient Care',
        href: '/#patients',
        description: 'Records, vitals and care plans',
      },
      {
        label: 'Blood Bank',
        href: '/#blood',
        description: 'Inventory, donors and requests',
      },
      {
        label: 'Organ Matching',
        href: '/#organ',
        description: 'Matching, waiting list and donors',
      },
      {
        label: 'Pharmacy',
        href: '/#pharmacy',
        description: 'Prescriptions and stock management',
      },
      {
        label: 'Billing',
        href: '/#billing',
        description: 'Invoices, insurance and discharge',
      },
    ],
  },
  {
    type: 'group',
    label: 'Solutions',
    items: [
      { label: 'For Doctors', href: '/#solutions', description: 'Clinical workflows and orders' },
      { label: 'For Nurses', href: '/#solutions', description: 'Wards, beds and vitals' },
      { label: 'For Blood Bank', href: '/#solutions', description: 'Supply and emergency response' },
      { label: 'For Pharmacy', href: '/#solutions', description: 'Dispensing and safety alerts' },
      { label: 'For Patients & Families', href: '/#solutions', description: 'Status, updates and discharge' },
    ],
  },
  { type: 'link', label: 'Modules', href: '/#modules' },
  { type: 'link', label: 'Security', href: '/#security' },
  { type: 'link', label: 'About', href: '/#about' },
]

export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Patient Care', href: '/#patients' },
      { label: 'Blood Bank', href: '/#blood' },
      { label: 'Organ Matching', href: '/#organ' },
      { label: 'Pharmacy', href: '/#pharmacy' },
      { label: 'Billing', href: '/#billing' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Doctors', href: '/#solutions' },
      { label: 'Nurses', href: '/#solutions' },
      { label: 'Blood Bank', href: '/#solutions' },
      { label: 'Pharmacy', href: '/#solutions' },
      { label: 'Patients & Families', href: '/#solutions' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'Security', href: '/#security' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/#privacy' },
      { label: 'Terms', href: '/#terms' },
    ],
  },
]