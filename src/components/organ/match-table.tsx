import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { cn } from 'cn'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  MatchStatusBadge,
  OrganTypeBadge,
  UrgencyBadge,
} from '@/components/organ/organ-status-badge'
import type { OrganMatch } from '@/types/organ'
import { timeAgo } from '@/lib/time'

const PAGE_SIZE = 10

function CompatibilityScore({ score }: { score: number }) {
  const tone =
    score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-14 overflow-hidden rounded-full bg-muted"
        role="presentation"
      >
        <div
          className={cn('h-full rounded-full', tone)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium tabular-nums">{score}%</span>
    </div>
  )
}

interface MatchTableProps {
  matches: OrganMatch[]
  onView: (match: OrganMatch) => void
}

/** Organ matching command-center table. */
export function MatchTable({ matches, onView }: MatchTableProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => matches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [matches, safePage],
  )

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No matching cases"
        description="Try adjusting the filters — matches will appear here when organs are assigned to candidates."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match ID</TableHead>
              <TableHead>Organ</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Blood group</TableHead>
              <TableHead>Compatibility</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Waiting time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((match) => (
              <TableRow key={match.matchId}>
                <TableCell className="text-sm font-medium">{match.matchId}</TableCell>
                <TableCell>
                  <OrganTypeBadge organ={match.organ} />
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="max-w-[11rem] truncate text-sm font-medium">
                      {match.recipientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.recipientId}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium tabular-nums">{match.bloodGroup}</span>
                </TableCell>
                <TableCell>
                  <CompatibilityScore score={match.compatibilityScore} />
                </TableCell>
                <TableCell>
                  <UrgencyBadge urgency={match.urgency} />
                </TableCell>
                <TableCell>
                  <span className="text-sm tabular-nums">{match.waitingTimeDays}d</span>
                </TableCell>
                <TableCell>
                  <p className="max-w-[10rem] truncate text-sm text-muted-foreground">
                    {match.recipientLocation}
                  </p>
                </TableCell>
                <TableCell>
                  <MatchStatusBadge status={match.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {timeAgo(match.lastUpdated)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(match)}
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