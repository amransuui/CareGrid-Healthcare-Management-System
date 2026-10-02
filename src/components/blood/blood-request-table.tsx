import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react'
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
  RequestStatusBadge,
  RequestUrgencyBadge,
} from '@/components/blood/blood-status-badge'
import { BLOOD_COMPONENT_LABELS, BLOOD_GROUPS, type BloodComponent } from '@/types/blood'
import type { BloodRequest } from '@/types/blood'
import { timeAgo } from '@/lib/time'

const PAGE_SIZE = 10

interface BloodRequestTableProps {
  requests: BloodRequest[]
  onView: (request: BloodRequest) => void
}

/** Blood request queue with search and filters. */
export function BloodRequestTable({ requests, onView }: BloodRequestTableProps) {
  const [search, setSearch] = useState('')
  const [bloodGroup, setBloodGroup] = useState('all')
  const [component, setComponent] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (requests ?? []).filter((request) => {
      if (bloodGroup !== 'all' && request.bloodGroup !== bloodGroup) return false
      if (component !== 'all' && request.component !== component) return false
      if (urgency !== 'all' && request.urgency !== urgency) return false
      if (status !== 'all' && request.status !== status) return false
      if (q) {
        const haystack =
          `${request.requestId} ${request.hospital} ${request.ward} ${request.patientName} ${request.patientId} ${request.coordinator}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [requests, search, bloodGroup, component, urgency, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  const hasActive =
    search !== '' || bloodGroup !== 'all' || component !== 'all' || urgency !== 'all' || status !== 'all'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor="request-search" className="sr-only">
            Search blood requests by ID, hospital, ward, patient or coordinator
          </label>
          <Input
            id="request-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by request ID, hospital, patient…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <Select value={component} onValueChange={(value) => { setComponent(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by component">
              <SelectValue placeholder="All components" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All components</SelectItem>
              {(Object.keys(BLOOD_COMPONENT_LABELS) as BloodComponent[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {BLOOD_COMPONENT_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={urgency} onValueChange={(value) => { setUrgency(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by urgency">
              <SelectValue placeholder="Any urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any urgency</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
                setBloodGroup('all')
                setComponent('all')
                setUrgency('all')
                setStatus('all')
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
          title="No requests match"
          description="Adjust the search or filters to see blood requests."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Hospital / ward</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Blood group</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((request) => (
                <TableRow key={request.requestId}>
                  <TableCell className="text-sm font-medium">{request.requestId}</TableCell>
                  <TableCell>
                    <p className="max-w-[12rem] truncate text-sm font-medium">{request.hospital}</p>
                    <p className="text-xs text-muted-foreground">{request.ward}</p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[9rem] truncate text-sm font-medium">{request.patientName}</p>
                    <p className="text-xs text-muted-foreground">{request.patientId}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium tabular-nums">{request.bloodGroup}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {BLOOD_COMPONENT_LABELS[request.component]}
                  </TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">
                    {request.unitsRequested}
                  </TableCell>
                  <TableCell>
                    <RequestUrgencyBadge urgency={request.urgency} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {timeAgo(request.requestedAt)}
                  </TableCell>
                  <TableCell>
                    <RequestStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {request.coordinator}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => onView(request)}>
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