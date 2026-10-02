import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, ListChecks, Search } from 'lucide-react'
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
  OrganTypeBadge,
  WaitlistPriorityBadge,
  WaitlistStatusBadge,
} from '@/components/organ/organ-status-badge'
import type { WaitingListCandidate } from '@/types/organ'
import { BLOOD_GROUPS } from '@/data/mock/patients'

const PAGE_SIZE = 10

export type WaitlistSort = 'position' | 'waiting' | 'lastReview'

interface WaitingTableProps {
  candidates: WaitingListCandidate[]
  onView: (candidate: WaitingListCandidate) => void
}

function waitingDays(candidate: WaitingListCandidate): number {
  return Math.max(0, Math.floor((Date.now() - new Date(candidate.registeredAt).getTime()) / 86_400_000))
}

/** National waiting list with search, filters and sorting. */
export function WaitingTable({ candidates, onView }: WaitingTableProps) {
  const [search, setSearch] = useState('')
  const [organ, setOrgan] = useState('all')
  const [bloodGroup, setBloodGroup] = useState('all')
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<WaitlistSort>('position')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = (candidates ?? []).filter((candidate) => {
      if (organ !== 'all' && candidate.organ !== organ) return false
      if (bloodGroup !== 'all' && candidate.bloodGroup !== bloodGroup) return false
      if (priority !== 'all' && candidate.priority !== priority) return false
      if (status !== 'all' && candidate.status !== status) return false
      if (q) {
        const haystack = `${candidate.patientName} ${candidate.patientId}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    return [...list].sort((a, b) => {
      if (sort === 'waiting') return waitingDays(b) - waitingDays(a)
      if (sort === 'lastReview') return new Date(b.lastReview).getTime() - new Date(a.lastReview).getTime()
      return a.position - b.position
    })
  }, [candidates, search, organ, bloodGroup, priority, status, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  const hasActive = search !== '' || organ !== 'all' || bloodGroup !== 'all' || priority !== 'all' || status !== 'all'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor="waitlist-search" className="sr-only">
            Search waiting list by patient name or ID
          </label>
          <Input
            id="waitlist-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by patient or ID…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
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
          <Select value={priority} onValueChange={(value) => { setPriority(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by priority">
              <SelectValue placeholder="Any priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Standard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="listed">Listed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="transplanted">Transplanted</SelectItem>
              <SelectItem value="dormant">Dormant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={sort} onValueChange={(value) => setSort(value as WaitlistSort)}>
          <SelectTrigger aria-label="Sort waiting list" className="lg:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="position">By position</SelectItem>
            <SelectItem value="waiting">Longest waiting</SelectItem>
            <SelectItem value="lastReview">Last reviewed</SelectItem>
          </SelectContent>
        </Select>
        {hasActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setOrgan('all')
              setBloodGroup('all')
              setPriority('all')
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
          icon={ListChecks}
          title="No candidates match"
          description="Adjust the search or filters to see waiting-list candidates."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Position</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Organ</TableHead>
                <TableHead>Blood group</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Waiting time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last review</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((candidate) => (
                <TableRow key={candidate.patientId}>
                  <TableCell>
                    <span className="flex size-7 items-center justify-center rounded-full border bg-muted text-xs font-semibold tabular-nums">
                      {candidate.position}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[11rem] truncate text-sm font-medium">
                      {candidate.patientName}
                    </p>
                    <p className="text-xs text-muted-foreground">{candidate.patientId}</p>
                  </TableCell>
                  <TableCell>
                    <OrganTypeBadge organ={candidate.organ} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium tabular-nums">
                      {candidate.bloodGroup}
                    </span>
                  </TableCell>
                  <TableCell>
                    <WaitlistPriorityBadge priority={candidate.priority} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums">{waitingDays(candidate)}d</span>
                  </TableCell>
                  <TableCell>
                    <WaitlistStatusBadge status={candidate.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {candidate.lastReview.slice(0, 10)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(candidate)}
                    >
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