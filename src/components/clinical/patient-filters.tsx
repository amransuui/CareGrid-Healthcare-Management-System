import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BLOOD_GROUPS,
  PATIENT_DEPARTMENTS,
} from '@/data/mock/patients'
import { WARD_NAMES } from '@/lib/clinical-options'
import {
  EMPTY_PATIENT_FILTERS,
  type PatientFilterState,
} from '@/lib/patient-filters'
import { Button } from '@/components/ui/button'

interface PatientFiltersProps {
  filters: PatientFilterState
  onChange: (next: PatientFilterState) => void
}

/** Search + status/ward/department/blood-group filters for the directory. */
export function PatientFilters({ filters, onChange }: PatientFiltersProps) {
  const hasActive =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.ward !== 'all' ||
    filters.department !== 'all' ||
    filters.bloodGroup !== 'all'

  const set = <K extends keyof PatientFilterState>(key: K, value: PatientFilterState[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <label htmlFor="patient-search" className="sr-only">
          Search patients by name, ID, phone or doctor
        </label>
        <Input
          id="patient-search"
          value={filters.search}
          onChange={(event) => set('search', event.target.value)}
          placeholder="Search by name, ID, phone or doctor…"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={filters.status}
          onValueChange={(value) => set('status', value as PatientFilterState['status'])}
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
            <SelectItem value="under_observation">Under observation</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="discharged">Discharged</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.ward} onValueChange={(value) => set('ward', value)}>
          <SelectTrigger aria-label="Filter by ward">
            <SelectValue placeholder="All wards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All wards</SelectItem>
            {WARD_NAMES.map((ward) => (
              <SelectItem key={ward} value={ward}>
                {ward}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.department} onValueChange={(value) => set('department', value)}>
          <SelectTrigger aria-label="Filter by department">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {PATIENT_DEPARTMENTS.map((department) => (
              <SelectItem key={department} value={department}>
                {department}
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
      </div>

      {hasActive ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_PATIENT_FILTERS)}
          aria-label="Clear all patient filters"
        >
          <X aria-hidden="true" className="size-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  )
}