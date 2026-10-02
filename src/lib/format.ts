/**
 * Shared display formatters. Every demo financial figure in the product is
 * expressed in Bangladeshi Taka (BDT) so the financial modules read as one
 * consistent system. No currency conversion or live rates are involved.
 */

export const DEMO_CURRENCY = 'BDT'
export const DEMO_CURRENCY_LABEL = '৳'

const groupingFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

/** `৳ 128,450` — full grouped amount, no decimals. */
export function formatBdt(amount: number): string {
  return `${DEMO_CURRENCY_LABEL} ${groupingFormatter.format(Math.round(amount))}`
}

/** `৳ 128,450.00` — grouped with paise, used on itemised invoice lines. */
export function formatBdtPrecise(amount: number): string {
  const value = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${DEMO_CURRENCY_LABEL} ${value}`
}

/**
 * Compact amount for KPI tiles: `৳ 1.2L`, `৳ 84.5K`, `৳ 640`. Keeps wide
 * totals from wrapping on mobile.
 */
export function formatBdtCompact(amount: number): string {
  const rounded = Math.round(amount)
  const sign = rounded < 0 ? '-' : ''
  const value = Math.abs(rounded)
  if (value >= 10_000_000) return `${sign}${DEMO_CURRENCY_LABEL} ${(value / 10_000_000).toFixed(1)}Cr`
  if (value >= 100_000) return `${sign}${DEMO_CURRENCY_LABEL} ${(value / 100_000).toFixed(1)}L`
  if (value >= 1_000) return `${sign}${DEMO_CURRENCY_LABEL} ${(value / 1_000).toFixed(1)}K`
  return `${sign}${DEMO_CURRENCY_LABEL} ${value}`
}

/** `85%` — used for insurance coverage share. */
export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`
}

/** Whole-unit quantities used by inventory and pharmacy views. */
export function formatUnits(value: number, noun = 'unit'): string {
  return `${groupingFormatter.format(value)} ${value === 1 ? noun : `${noun}s`}`
}
