import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Search, UsersRound } from 'lucide-react'
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
  ContactStatusBadge,
  DonorStatusBadge,
} from '@/components/blood/blood-status-badge'
import { BLOOD_GROUPS } from '@/types/blood'
import { computeDonorEligibility } from '@/lib/blood'
import type { BloodDonor } from '@/types/blood'
import { formatDate } from '@/lib/clinical'
import { userInitials } from '@/lib/utils'

const PAGE_SIZE = 10

export type DonorSort = 'screening' | 'lastDonation' | 'name'

interface BloodDonorTableProps {
  donors: BloodDonor[]
  onView: (donor: BloodDonor) => void
}

/** Donor registry table with eligibility computed by the 56-day rule. */
export function BloodDonorTable({ donors, onView }: BloodDonorTableProps) {
  const [search, setSearch] = useState('')
  const [bloodGroup, setBloodGroup] = useState('all')
  const [eligibility, setEligibility] = useState('all')
  const [contact, setContact] = useState('all')
  const [sort, setSort] = useState<DonorSort>('screening')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = (donors ?? []).filter((donor) => {
      if (bloodGroup !== 'all' && donor.bloodGroup !== bloodGroup) return false
      if (eligibility !== 'all' && computeDonorEligibility(donor).status !== eligibility) return false
      if (contact !== 'all' && donor.contact !== contact) return false
      if (q) {
        const haystack = `${donor.fullName} ${donor.donorId} ${donor.location} ${donor.phone}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.fullName.localeCompare(b.fullName)
      if (sort === 'lastDonation') {
        const aDate = a.lastDonation ? new Date(a.lastDonation).getTime() : 0
        const bDate = b.lastDonation ? new Date(b.lastDonation).getTime() : 0
        return bDate - aDate
      }
      return new Date(b.lastScreening).getTime() - new Date(a.lastScreening).getTime()
    })
  }, [donors, search, bloodGroup, eligibility, contact, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  const hasActive =
    search !== '' || bloodGroup !== 'all' || eligibility !== 'all' || contact !== 'all'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor="blood-donor-search" className="sr-only">
            Search donors by name, ID, location or phone
          </label>
          <Input
            id="blood-donor-search"
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
          <Select value={eligibility} onValueChange={(value) => { setEligibility(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by eligibility">
              <SelectValue placeholder="Any eligibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any eligibility</SelectItem>
              <SelectItem value="eligible">Eligible</SelectItem>
              <SelectItem value="donated_recently">Recently donated</SelectItem>
              <SelectItem value="deferred">Temporarily unavailable</SelectItem>
              <SelectItem value="ineligible">Not eligible</SelectItem>
            </SelectContent>
          </Select>
          <Select value={contact} onValueChange={(value) => { setContact(value); setPage(1) }}>
            <SelectTrigger aria-label="Filter by contact status">
              <SelectValue placeholder="Any contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any contact status</SelectItem>
              <SelectItem value="confirmed">Reachable</SelectItem>
              <SelectItem value="pending">Contact pending</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={sort} onValueChange={(value) => setSort(value as DonorSort)}>
          <SelectTrigger aria-label="Sort donors" className="lg:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="screening">Last screened</SelectItem>
            <SelectItem value="lastDonation">Last donation</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>
        {hasActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setBloodGroup('all')
              setEligibility('all')
              setContact('all')
              setPage(1)
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No donors match"
          description="Adjust the search or filters to see donor records."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Blood group</TableHead>
                <TableHead>Last donation</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((donor) => {
                const eligibilityInfo = computeDonorEligibility(donor)
                return (
                  <TableRow key={donor.donorId}>
                    <TableCell className="text-sm font-medium">{donor.donorId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
                          aria-hidden="true"
                        >
                          {userInitials(donor.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[10rem] truncate text-sm font-medium">
                            {donor.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {donor.age} yrs · {donor.totalDonations} donations
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium tabular-nums">{donor.bloodGroup}</span>
                    </TableCell>
                    <TableCell>
                      {donor.lastDonation ? (
                        <>
                          <p className="text-sm tabular-nums">{formatDate(donor.lastDonation)}</p>
                          {eligibilityInfo.status === 'donated_recently' ? (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              {eligibilityInfo.holdingDaysLeft}d until next
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DonorStatusBadge status={eligibilityInfo.status} />
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[8rem] truncate text-sm text-muted-foreground">
                        {donor.location}
                      </p>
                    </TableCell>
                    <TableCell>
                      <ContactStatusBadge status={donor.contact} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => onView(donor)}>
                        <Eye aria-hidden="true" className="size-3.5" />
                        <span className="hidden md:inline">View</span>
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