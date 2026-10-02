/**
 * Pure list-manipulation helpers shared by every table in the product
 * (patients, pharmacy, billing, claims, discharge, notifications). Keeping
 * them here means sorting/paging behaviour is identical everywhere and pages
 * only declare their columns.
 */

export type SortDirection = 'asc' | 'desc'

export interface SortState<K extends string> {
  key: K
  direction: SortDirection
}

export type SortAccessors<T, K extends string> = Record<
  K,
  (row: T) => string | number
>

/** Toggles a column: same column flips direction, a new column starts asc. */
export function toggleSort<K extends string>(
  current: SortState<K>,
  key: K,
): SortState<K> {
  if (current.key === key) {
    return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
  }
  return { key, direction: 'asc' }
}

export function sortRows<T, K extends string>(
  rows: readonly T[],
  sort: SortState<K>,
  accessors: SortAccessors<T, K>,
): T[] {
  const read = accessors[sort.key]
  if (!read) return [...rows]
  const factor = sort.direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = read(a)
    const right = read(b)
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * factor
    }
    return String(left).localeCompare(String(right), undefined, {
      numeric: true,
      sensitivity: 'base',
    }) * factor
  })
}

/** Rows for the requested page, clamped to the available range. */
export function paginate<T>(rows: readonly T[], page: number, pageSize: number): T[] {
  const safeSize = Math.max(1, pageSize)
  const total = pageCountFor(rows.length, safeSize)
  const safePage = Math.min(Math.max(1, page), total)
  const start = (safePage - 1) * safeSize
  return rows.slice(start, start + safeSize)
}

export function pageCountFor(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
}

/** Case-insensitive "does this row contain the query" test. */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return haystack.toLowerCase().includes(q)
}
