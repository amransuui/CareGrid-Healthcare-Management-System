import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Syringe } from 'lucide-react'
import { Link } from 'react-router-dom'
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
  VitalsLevelBadge,
} from '@/components/clinical/clinical-status-badge'
import type { Patient, VitalsReading } from '@/types/clinical'
import { vitalsLevel } from '@/lib/clinical'
import { timeAgo } from '@/lib/time'
import { userInitials } from '@/lib/utils'

const PAGE_SIZE = 10

interface VitalsTableProps {
  readings: VitalsReading[]
  patientById: ReadonlyMap<string, Patient>
  canRecord: boolean
  onRecordVitals: (patient: Patient) => void
}

/** Latest-vitals registry: recent observations with a level flag. */
export function VitalsTable({
  readings,
  patientById,
  canRecord,
  onRecordVitals,
}: VitalsTableProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(readings.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = useMemo(
    () => readings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [readings, safePage],
  )

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No vitals recorded"
        description="Readings will appear here once observations are recorded."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Ward / Bed</TableHead>
              <TableHead>Recorded</TableHead>
              <TableHead className="text-right">HR</TableHead>
              <TableHead className="text-right">BP</TableHead>
              <TableHead className="text-right">Temp</TableHead>
              <TableHead className="text-right">SpO₂</TableHead>
              <TableHead className="text-right">RR</TableHead>
              <TableHead>Flag</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((reading) => {
              const patient = patientById.get(reading.patientId)
              const flag = vitalsLevel(reading)
              return (
                <TableRow key={reading.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
                        aria-hidden="true"
                      >
                        {patient ? userInitials(patient.fullName) : reading.patientId.slice(-3)}
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-[11rem] truncate text-sm font-medium">
                          {patient?.fullName ?? reading.patientId}
                        </p>
                        <p className="text-xs text-muted-foreground">{patient?.patientId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {patient ? patient.ward : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patient?.bed ?? 'Unassigned'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm tabular-nums">{timeAgo(reading.recordedAt)}</p>
                    <p className="text-xs text-muted-foreground">{reading.recordedBy}</p>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {reading.heartRate}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {reading.systolic}/{reading.diastolic}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {reading.temperature.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {reading.spo2}%
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {reading.respiratoryRate}
                  </TableCell>
                  <TableCell>
                    <VitalsLevelBadge
                      level={flag.level}
                      label={flag.label}
                      className="max-w-[8rem]"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {patient ? (
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/app/vitals/${patient.patientId}`}>
                            <Eye aria-hidden="true" className="size-3.5" />
                            <span className="hidden md:inline">Trend</span>
                          </Link>
                        </Button>
                      ) : null}
                      {canRecord && patient ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRecordVitals(patient)}
                        >
                          <Syringe aria-hidden="true" className="size-3.5" />
                          <span className="hidden xl:inline">Record</span>
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
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