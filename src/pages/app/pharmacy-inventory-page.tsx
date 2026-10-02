import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Boxes, CalendarClock, Eye, Package, Search, TriangleAlert } from 'lucide-react'
import { cn } from 'cn'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { MedicineStockBadge } from '@/components/pharmacy/pharmacy-status-badges'
import { MedicineDrawer } from '@/components/pharmacy/medicine-drawer'
import { PHARMACY_CATEGORIES } from '@/data/mock/pharmacy'
import { daysUntilExpiry, formatExpiry, medicineStockStatus } from '@/lib/pharmacy'
import {
  MEDICINE_STOCK_LABELS,
  MEDICINE_STOCK_STATUSES,
  type MedicineStockStatus,
  type PharmacyMedicine,
} from '@/types/pharmacy'
import { pharmacyService } from '@/services'

const PAGE_SIZE = 10
const EXPIRY_FILTER_OPTIONS = [
  { value: 'all', label: 'All expiry' },
  { value: '30', label: 'Within 30 days' },
  { value: '90', label: 'Within 90 days' },
  { value: 'later', label: 'Over 90 days' },
] as const

/** Pharmacy stock inventory with stock and expiry management views. */
export function PharmacyInventoryPage() {
  const { data: medicines, isLoading, isError, refetch } = useQuery({
    queryKey: ['pharmacy', 'medicines'],
    queryFn: () => pharmacyService.listMedicines(),
  })

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [expiry, setExpiry] = useState<string>('all')
  const [sort, setSort] = useState<'name' | 'stockAsc' | 'expiryAsc'>('name')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<PharmacyMedicine | null>(null)

  const items = medicines ?? []

  const kpis = useMemo(() => {
    return {
      total: items.length,
      low: items.filter((medicine) => medicineStockStatus(medicine) === 'low_stock').length,
      out: items.filter((medicine) => medicineStockStatus(medicine) === 'out_of_stock').length,
      expiring: items.filter((medicine) => medicineStockStatus(medicine) === 'expiring_soon').length,
    }
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = items.filter((medicine) => {
      if (category !== 'all' && medicine.category !== category) return false
      if (status !== 'all' && medicineStockStatus(medicine) !== status) return false
      if (expiry !== 'all') {
        const days = daysUntilExpiry(medicine.expiryDate)
        if (expiry === '30' && days > 30) return false
        if (expiry === '90' && days > 90) return false
        if (expiry === 'later' && days <= 90) return false
      }
      if (q) {
        const haystack =
          `${medicine.name} ${medicine.genericName} ${medicine.strength} ${medicine.category}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    const sorted = [...list]
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'stockAsc') sorted.sort((a, b) => a.stock - b.stock)
    else sorted.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
    return sorted
  }, [items, search, category, status, expiry, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  const hasActive =
    search !== '' || category !== 'all' || status !== 'all' || expiry !== 'all'

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full sm:w-2/3" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container>
        <ErrorState
          title="Could not load the inventory"
          description="The pharmacy inventory could not be read. Please try again."
          onRetry={() => void refetch()}
        />
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <PageHeader
          title="Pharmacy inventory"
          description="Track medication stock, reorder points and expiry windows across the pharmacy store."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Medications tracked"
            value={kpis.total}
            context="Catalog items in the pharmacy store"
            icon={Package}
            tone="neutral"
          />
          <KpiCard
            label="Low stock"
            value={kpis.low}
            context="At or below reorder level — plan restock"
            icon={TriangleAlert}
            tone="warning"
          />
          <KpiCard
            label="Out of stock"
            value={kpis.out}
            context="Unavailable items needing purchase orders"
            icon={Boxes}
            tone="critical"
          />
          <KpiCard
            label="Expiring soon"
            value={kpis.expiring}
            context="Batches within the next 30 days"
            icon={CalendarClock}
            tone="warning"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <label htmlFor="medicine-search" className="sr-only">
              Search medicines by name, generic or category
            </label>
            <Input
              id="medicine-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search medicines…"
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1) }}>
              <SelectTrigger aria-label="Filter by category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {PHARMACY_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
              <SelectTrigger aria-label="Filter by stock status">
                <SelectValue placeholder="All stock statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stock statuses</SelectItem>
                {(MEDICINE_STOCK_STATUSES as readonly MedicineStockStatus[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {MEDICINE_STOCK_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={expiry} onValueChange={(value) => { setExpiry(value); setPage(1) }}>
              <SelectTrigger aria-label="Filter by expiry window">
                <SelectValue placeholder="All expiry" />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(value) => { setSort(value as typeof sort); setPage(1) }}>
              <SelectTrigger aria-label="Sort inventory">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="stockAsc">Lowest stock first</SelectItem>
                <SelectItem value="expiryAsc">Nearest expiry first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActive ? (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setCategory('all')
                  setStatus('all')
                  setExpiry('all')
                  setPage(1)
                }}
              >
                Clear
              </Button>
            </div>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No medicines match"
            description="Adjust the search or filters to see the inventory."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Reorder level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((medicine) => {
                  const days = daysUntilExpiry(medicine.expiryDate)
                  return (
                    <TableRow key={medicine.medicineId}>
                      <TableCell>
                        <p className="text-sm font-medium">{medicine.name}</p>
                        <p className="text-xs text-muted-foreground">{medicine.genericName}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {medicine.category}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {medicine.strength}
                      </TableCell>
                      <TableCell className="text-sm font-medium tabular-nums">
                        {medicine.stock}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground tabular-nums">
                        {medicine.reorderLevel}
                      </TableCell>
                      <TableCell>
                        <MedicineStockBadge status={medicineStockStatus(medicine)} />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{formatExpiry(medicine.expiryDate)}</p>
                        <p
                          className={cn(
                            'text-xs',
                            days < 0
                              ? 'font-medium text-destructive'
                              : days <= 30
                                ? 'font-medium text-amber-600 dark:text-amber-400'
                                : 'text-muted-foreground',
                          )}
                        >
                          {days < 0 ? 'Expired' : `${days} day${days === 1 ? '' : 's'}`}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelected(medicine)}>
                          <Eye aria-hidden="true" className="size-3.5" />
                          <span className="hidden md:inline">Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                aria-label="Previous page"
              >
                Previous
              </Button>
            </PaginationItem>
            {Array.from({ length: Math.min(pageCount, 7) }, (_, index) => (
              <PaginationItem key={index + 1}>
                <PaginationLink
                  isActive={index + 1 === safePage}
                  onClick={() => setPage(index + 1)}
                  className={cn(index + 1 === safePage ? 'cursor-default' : 'cursor-pointer')}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                aria-label="Next page"
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <MedicineDrawer
        medicine={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </Container>
  )
}