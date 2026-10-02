import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Search, TriangleAlert } from 'lucide-react'
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
  PharmacyStatusBadge,
  PrescriptionStatusBadge,
} from '@/components/pharmacy/pharmacy-status-badges'
import {
  PRESCRIPTION_STATUSES,
  PRESCRIPTION_STATUS_LABELS,
  type Prescription,
} from '@/types/pharmacy'
import { formatDateTime } from '@/lib/clinical'

const PAGE_SIZE = 10
const SYSTEM_DATE_FILTERS = ['all', 'today', '7d', '30d'] as const

type SystemDateFilter = (typeof SYSTEM_DATE_FILTERS)[number]

const DATE_FILTER_LABELS: Record<SystemDateFilter, string> = {
  all: 'All time',
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
}

interface PrescriptionTableProps {
  prescriptions: Prescription[]
  patientOptions: string[]
  doctorOptions: string[]
  onView: (prescription: Prescription) => void
}

/** Prescription list with search, patient/doctor/status/date filters, sorting and pagination. */
export function PrescriptionTable({
  prescriptions,
  patientOptions,
  doctorOptions,
  onView,
}: PrescriptionTableProps) {
  const [search, setSearch] = useState('')
  const [patient, setPatient] = useState('all')
  const [doctor, setDoctor] = useState('all')
  const [status, setStatus] = useState('all')
  const [dateFilter, setDateFilter] = useState<SystemDateFilter>('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'patient'>('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const cutoff =
      dateFilter === 'today'
        ? startOfToday
        : dateFilter === '7d'
          ? now.getTime() - 7 * 86_400_000
          : dateFilter === '30d'
            ? now.getTime() - 30 * 86_400_000
            : Number.NEGATIVE_INFINITY

    const list = (prescriptions ?? []).filter((prescription) => {
      if (patient !== 'all' && prescription.patientName !== patient) return false
      if (doctor !== 'all' && prescription.doctorName !== doctor) return false
      if (status !== 'all' && prescription.status !== status) return false
      if (new Date(prescription.createdAt).getTime() < cutoff) return false
      if (q) {
        const haystack =
          `${prescription.prescriptionId} ${prescription.patientName} ${prescription.patientId} ${prescription.doctorName} ${prescription.diagnosis}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    const sorted = [...list]
    if (sort === 'newest') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else if (sort === 'oldest') sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    else sorted.sort((a, b) => a.patientName.localeCompare(b.patientName))
    return sorted
  }, [prescriptions, search, patient, doctor, status, dateFilter, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  const hasActive =
    search !== '' ||
    patient !== 'all' ||
    doctor !== 'all' ||
    status !== 'all' ||
    dateFilter !== 'all'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor="prescription-search" className="sr-only">
            Search prescriptions by ID, patient or doctor
          </label>
          <Input
            id="prescription-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search RX ID, patient, doctor…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Select value={patient} onValueChange={(value) => { setPatient(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by patient">
              <SelectValue placeholder="All patients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All patients</SelectItem>
              {patientOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={doctor} onValueChange={(value) => { setDoctor(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by doctor">
              <SelectValue placeholder="All prescribers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prescribers</SelectItem>
              {doctorOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by prescription status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {PRESCRIPTION_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {PRESCRIPTION_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={dateFilter}
            onValueChange={(value) => {
              setDateFilter(value as SystemDateFilter)
              setPage(1)
            }}
          >
            <SelectTrigger aria-label="Filter by date">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              {(SYSTEM_DATE_FILTERS as readonly SystemDateFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {DATE_FILTER_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => { setSort(value as typeof sort); setPage(1) }}>
            <SelectTrigger aria-label="Sort prescriptions">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="patient">Patient A–Z</SelectItem>
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
                setPatient('all')
                setDoctor('all')
                setStatus('all')
                setDateFilter('all')
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
          title="No prescriptions match"
          description="Adjust the search or filters to see prescriptions."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prescription</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Prescriber</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Warnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((prescription) => (
                <TableRow key={prescription.prescriptionId}>
                  <TableCell className="text-sm font-medium">
                    {prescription.prescriptionId}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[10rem] truncate text-sm font-medium">
                      {prescription.patientName}
                    </p>
                    <p className="text-xs text-muted-foreground">{prescription.patientId}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {prescription.doctorName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDateTime(prescription.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">
                    {prescription.medications.length}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[16rem] truncate text-sm text-muted-foreground">
                      {prescription.diagnosis}
                    </p>
                  </TableCell>
                  <TableCell>
                    {prescription.warnings.length > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400"
                        title={`${prescription.warnings.length} safety flag(s) — review details`}
                      >
                        <TriangleAlert aria-hidden="true" className="size-4" />
                        {prescription.warnings.length}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <PrescriptionStatusBadge status={prescription.status} />
                  </TableCell>
                  <TableCell>
                    <PharmacyStatusBadge status={prescription.pharmacyStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => onView(prescription)}>
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