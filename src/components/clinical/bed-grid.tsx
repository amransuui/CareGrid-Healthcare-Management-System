import { useMemo, useState } from 'react'
import { cn } from 'cn'
import { EmptyState } from '@/components/common/empty-state'
import { BedStatusBadge } from '@/components/clinical/clinical-status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Bed, Patient } from '@/types/clinical'
import { WARD_NAMES } from '@/lib/clinical-options'
import { UserRound } from 'lucide-react'

interface BedGridProps {
  beds: Bed[]
  patientById: ReadonlyMap<string, Patient>
  onSelect: (bed: Bed) => void
}

const statusRing: Record<string, string> = {
  available: 'border-emerald-300 dark:border-emerald-500/40',
  occupied: 'border-sky-300 dark:border-sky-500/40',
  cleaning: 'border-slate-300 dark:border-slate-600',
  reserved: 'border-amber-300 dark:border-amber-500/40',
}

/** Ward bed visualization grouped by ward with per-bed occupancy state. */
export function BedGrid({ beds, patientById, onSelect }: BedGridProps) {
  const [ward, setWard] = useState<'all' | string>('all')

  const filtered = useMemo(
    () => (ward === 'all' ? beds : beds.filter((bed) => bed.ward === ward)),
    [beds, ward],
  )

  if (filtered.length === 0) {
    return (
      <EmptyState
        title="No beds to display"
        description="Select a ward to see its bed layout."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={ward} onValueChange={setWard}>
          <SelectTrigger aria-label="Filter beds by ward" className="w-48">
            <SelectValue placeholder="All wards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All wards</SelectItem>
            {WARD_NAMES.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((bed) => {
          const patient = bed.patientId ? patientById.get(bed.patientId) : undefined
          return (
            <button
              key={bed.id}
              type="button"
              onClick={() => onSelect(bed)}
              className={cn(
                'group rounded-xl border bg-card p-3 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring',
                statusRing[bed.status],
              )}
              aria-label={`${bed.number}, ${bed.status}${patient ? `, ${patient.fullName}` : ''}. Open bed details.`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{bed.number}</span>
                <BedStatusBadge status={bed.status} className="px-1.5" />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                {patient ? (
                  <>
                    <UserRound aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="truncate">{patient.fullName}</span>
                  </>
                ) : (
                  <span className="truncate">
                    {bed.status === 'cleaning'
                      ? 'Being prepared'
                      : bed.status === 'reserved'
                        ? 'Held for a patient'
                        : 'Ready for admission'}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}