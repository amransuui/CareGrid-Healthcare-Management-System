import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  HeartHandshake,
  Search,
} from 'lucide-react'
import { cn } from 'cn'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
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
  DonorAvailabilityBadge,
  DonorEvaluationBadge,
  OrganTypeBadge,
} from '@/components/organ/organ-status-badge'
import type { LivingDonor } from '@/types/organ'
import { DONOR_AVAILABILITY_LABELS, ORGAN_TYPE_LABELS } from '@/types/organ'
import { BLOOD_GROUPS } from '@/data/mock/patients'

const PAGE_SIZE = 10

type DonorSortKey =
  | 'donorId'
  | 'fullName'
  | 'bloodGroup'
  | 'organ'
  | 'compatibility'
  | 'availability'
  | 'lastScreening'
  | 'location'

type DonorSortDir = 'asc' | 'desc'

function sortValue(donor: LivingDonor, key: DonorSortKey): string | number {
  switch (key) {
    case 'compatibility': {
      const match = donor.compatibility.match(/\d+/)
      return match ? Number(match[0]) : -1
    }
    case 'availability':
      return DONOR_AVAILABILITY_LABELS[donor.availability]
    case 'organ':
      return ORGAN_TYPE_LABELS[donor.organ]
    default:
      return String(donor[key])
  }
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  sortDir,
  onSort,
  className,
}: {
  label: string
  sortKey: DonorSortKey
  activeKey: DonorSortKey | null
  sortDir: DonorSortDir
  onSort: (key: DonorSortKey) => void
  className?: string
}) {
  const active = activeKey === sortKey
  return (
    <TableHead
      aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={className}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
        className="inline-flex items-center gap-1 font-medium hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {label}
        {active ? (
          sortDir === 'asc' ? (
            <ChevronUp aria-hidden="true" className="size-3.5" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown aria-hidden="true" className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}

interface DonorTableProps {
  donors: LivingDonor[]
  onView: (donor: LivingDonor) => void
}

/** Living donor registry with search, filters, sorting and pagination. */
export function DonorTable({ donors, onView }: DonorTableProps) {
  const [search, setSearch] = useState('')
  const [organ, setOrgan] = useState('all')
  const [bloodGroup, setBloodGroup] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortKey, setSortKey] = useState<DonorSortKey | null>(null)
  const [sortDir, setSortDir] = useState<DonorSortDir>('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (donors ?? []).filter((donor) => {
      if (organ !== 'all' && donor.organ !== organ) return false
      if (bloodGroup !== 'all' && donor.bloodGroup !== bloodGroup) return false
      if (status !== 'all' && donor.evaluationStatus !== status) return false
      if (q) {
        const haystack =
          `${donor.fullName} ${donor.donorId} ${donor.location} ${donor.phone}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [donors, search, organ, bloodGroup, status])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const aValue = sortValue(a, sortKey)
      const bValue = sortValue(b, sortKey)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * dir
      }
      return String(aValue).localeCompare(String(bValue)) * dir
    })
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sorted, safePage],
  )

  const hasActive = search !== '' || organ !== 'all' || bloodGroup !== 'all' || status !== 'all'

  const handleSort = (key: DonorSortKey) => {
    setPage(1)
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor="donor-search" className="sr-only">
            Search donors by name, ID, location or phone
          </label>
          <Input
            id="donor-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by name, ID, location…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select value={organ} onValueChange={(value) => { setOrgan(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by organ">
              <SelectValue placeholder="All organs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organs</SelectItem>
              {['kidney', 'liver', 'heart', 'lung', 'pancreas'].map((value) => (
                <SelectItem key={value} value={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bloodGroup} onValueChange={(value) => { setBloodGroup(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by blood group">
              <SelectValue placeholder="All blood groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All blood groups</SelectItem>
              {BLOOD_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by evaluation status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="under_evaluation">Under evaluation</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="deferred">Deferred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setOrgan('all')
              setBloodGroup('all')
              setStatus('all')
              setPage(1)
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No donors match"
          description="Adjust the search or filters to see living donor records."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader label="Donor ID" sortKey="donorId" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Donor" sortKey="fullName" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Blood group" sortKey="bloodGroup" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Organ" sortKey="organ" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Compatibility" sortKey="compatibility" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <TableHead>Evaluation status</TableHead>
                <SortHeader label="Availability" sortKey="availability" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Last screening" sortKey="lastScreening" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Location" sortKey="location" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} className="hidden xl:table-cell" />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((donor) => (
                <TableRow key={donor.donorId}>
                  <TableCell className="text-sm font-medium">{donor.donorId}</TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="max-w-[10rem] truncate text-sm font-medium">
                        {donor.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">{donor.age} yrs</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium tabular-nums">{donor.bloodGroup}</span>
                  </TableCell>
                  <TableCell>
                    <OrganTypeBadge organ={donor.organ} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums">{donor.compatibility}</span>
                  </TableCell>
                  <TableCell>
                    <DonorEvaluationBadge status={donor.evaluationStatus} />
                  </TableCell>
                  <TableCell>
                    <DonorAvailabilityBadge availability={donor.availability} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {donor.lastScreening.slice(0, 10)}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                    <p className="max-w-[8rem] truncate">{donor.location}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => onView(donor)}>
                      <Eye aria-hidden="true" className="size-3.5" />
                      <span className="hidden md:inline">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
              <ChevronLeft aria-hidden="true" className="size-4" />
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
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}