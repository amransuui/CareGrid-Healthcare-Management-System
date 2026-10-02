import type { BloodComponent, StockStatus } from '@/types/blood'

/** Client-side filter state for the blood inventory matrix. */
export interface BloodInventoryFilterState {
  search: string
  bloodGroup: 'all' | string
  component: 'all' | BloodComponent
  status: 'all' | StockStatus
  /** Expiry window; `all` ignores expiry. */
  expiry: 'all' | 'within7' | 'within30'
}

export const EMPTY_BLOOD_INVENTORY_FILTERS: BloodInventoryFilterState = {
  search: '',
  bloodGroup: 'all',
  component: 'all',
  status: 'all',
  expiry: 'all',
}

export const STOCK_FILTER_OPTIONS: Array<{ value: StockStatus; label: string }> = [
  { value: 'safe', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'critical', label: 'Critical' },
]

export const EXPIRY_FILTER_OPTIONS = [
  { value: 'within7', label: 'Expires ≤ 7 days' },
  { value: 'within30', label: 'Expires ≤ 30 days' },
]