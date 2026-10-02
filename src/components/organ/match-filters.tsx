import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { BLOOD_GROUPS } from '@/data/mock/patients'
import {
  MATCH_STATUS_LABELS,
  ORGAN_TYPE_LABELS,
  type MatchStatus,
  type OrganType,
} from '@/types/organ'
import {
  COMPATIBILITY_FLOORS,
  EMPTY_MATCH_FILTERS,
  type MatchFilterState,
} from '@/lib/organ-filters'
import { ORGANS_ON_WAITLIST } from '@/data/mock/organ'

interface MatchFiltersProps {
  filters: MatchFilterState
  onChange: (next: MatchFilterState) => void
}

/** Filter bar: search, organ, blood group, urgency, status, score floor. */
export function MatchFilters({ filters, onChange }: MatchFiltersProps) {
  const hasActive =
    filters.search !== '' ||
    filters.organ !== 'all' ||
    filters.bloodGroup !== 'all' ||
    filters.urgency !== 'all' ||
    filters.status !== 'all' ||
    filters.minScore !== 0

  const set = <K extends keyof MatchFilterState>(key: K, value: MatchFilterState[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <label htmlFor="match-search" className="sr-only">
          Search matches by recipient, donor, ID or location
        </label>
        <Input
          id="match-search"
          value={filters.search}
          onChange={(event) => set('search', event.target.value)}
          placeholder="Search by recipient, donor, match ID or location…"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select value={filters.organ} onValueChange={(value) => set('organ', value as MatchFilterState['organ'])}>
          <SelectTrigger aria-label="Filter by organ type">
            <SelectValue placeholder="All organs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All organs</SelectItem>
            {ORGANS_ON_WAITLIST.split(', ').map((organ) => (
              <SelectItem key={organ} value={organ}>
                {ORGAN_TYPE_LABELS[organ as OrganType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.bloodGroup} onValueChange={(value) => set('bloodGroup', value)}>
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

        <Select value={filters.urgency} onValueChange={(value) => set('urgency', value as MatchFilterState['urgency'])}>
          <SelectTrigger aria-label="Filter by urgency">
            <SelectValue placeholder="Any urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any urgency</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => set('status', value as MatchFilterState['status'])}>
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(MATCH_STATUS_LABELS) as MatchStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {MATCH_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(filters.minScore)} onValueChange={(value) => set('minScore', Number(value))}>
          <SelectTrigger aria-label="Filter by compatibility score">
            <SelectValue placeholder="Any score" />
          </SelectTrigger>
          <SelectContent>
            {COMPATIBILITY_FLOORS.map((floor) => (
              <SelectItem key={floor.value} value={String(floor.value)}>
                {floor.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActive ? (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_MATCH_FILTERS)}
            aria-label="Clear all match filters"
          >
            <X aria-hidden="true" className="size-3.5" />
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  )
}