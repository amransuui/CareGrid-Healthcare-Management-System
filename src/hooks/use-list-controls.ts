import { useCallback, useMemo, useState } from 'react'
import {
  pageCountFor,
  paginate,
  sortRows,
  toggleSort,
  type SortAccessors,
  type SortState,
} from '@/lib/table'

export interface ListControls<T, K extends string> {
  /** All rows after sorting (pre-pagination). */
  sorted: T[]
  /** Rows for the current page only. */
  rows: T[]
  page: number
  pageCount: number
  total: number
  sort: SortState<K>
  /** Cycles the given column between ascending and descending. */
  onSort: (key: K) => void
  /** Sets an explicit sort (used by "Sort by…" controls outside the header). */
  setSort: (next: SortState<K>) => void
  setPage: (page: number) => void
  /** Call after a search or filter change so the view stays in range. */
  clampPage: () => void
}

interface UseListControlsOptions<T, K extends string> {
  /** Fully filtered rows for the active search/filter combination. */
  rows: T[]
  accessors: SortAccessors<T, K>
  initialSort: SortState<K>
  pageSize: number
}

/**
 * Sorting and pagination state for a data table. Pages keep ownership of their
 * own search and filter values; this hook owns ordering and paging so every
 * table in the product behaves identically.
 */
export function useListControls<T, K extends string>({
  rows,
  accessors,
  initialSort,
  pageSize,
}: UseListControlsOptions<T, K>): ListControls<T, K> {
  const [sort, setSort] = useState<SortState<K>>(initialSort)
  const [page, setPageState] = useState(1)

  const sorted = useMemo(() => sortRows(rows, sort, accessors), [rows, sort, accessors])
  const pageCount = useMemo(
    () => pageCountFor(sorted.length, pageSize),
    [sorted.length, pageSize],
  )
  const safePage = Math.min(Math.max(1, page), pageCount)
  const visible = useMemo(
    () => paginate(sorted, safePage, pageSize),
    [sorted, safePage, pageSize],
  )

  const onSort = useCallback((key: K) => {
    setSort((current) => toggleSort(current, key))
  }, [])

  const setSortState = useCallback((next: SortState<K>) => setSort(next), [])

  const setPage = useCallback(
    (next: number) => setPageState(Math.min(Math.max(1, next), pageCount)),
    [pageCount],
  )

  const clampPage = useCallback(() => {
    setPageState((current) => Math.min(Math.max(1, current), pageCount))
  }, [pageCount])

  return {
    sorted,
    rows: visible,
    page: safePage,
    pageCount,
    total: sorted.length,
    sort,
    onSort,
    setSort: setSortState,
    setPage,
    clampPage,
  }
}
