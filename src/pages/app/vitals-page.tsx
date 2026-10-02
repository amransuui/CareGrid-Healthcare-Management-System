import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Syringe } from 'lucide-react'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  RecordVitalsDialog,
  VitalsTable,
} from '@/components/clinical'
import type { Patient, RecordVitalsInput } from '@/types/clinical'
import { useSession } from '@/hooks/use-auth'
import { VITALS_DISCLAIMER, vitalsLevel } from '@/lib/clinical'
import { isWithinMinutes } from '@/lib/time'
import { isClinician } from '@/lib/roles'
import { patientService, vitalsService } from '@/services'

type LevelFilter = 'all' | 'steady' | 'watch' | 'critical'

type TimeRange = '15' | '60' | '180' | '360' | 'all'

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: '15', label: 'Last 15 minutes' },
  { value: '60', label: 'Last hour' },
  { value: '180', label: 'Last 3 hours' },
  { value: '360', label: 'Last 6 hours' },
  { value: 'all', label: 'All time' },
]

const toMinutes = (value: TimeRange): number =>
  value === 'all' ? Number.POSITIVE_INFINITY : Number(value)

function KpiTile({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? ''}`}
      >
        {value}
      </p>
    </div>
  )
}

/** Vitals monitoring page: KPIs, filters and the latest-readings registry. */
export function VitalsPage() {
  const session = useSession()
  const clinician = isClinician(session?.user.role)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [level, setLevel] = useState<LevelFilter>('all')
  const [ward, setWard] = useState<'all' | string>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [recordOpen, setRecordOpen] = useState(false)
  const [recordPatient, setRecordPatient] = useState<Patient | null>(null)

  const { data: readings, isLoading, isError, refetch } = useQuery({
    queryKey: ['vitals', 'latest'],
    queryFn: () => vitalsService.latestReadings(),
  })
  const { data: patients } = useQuery({
    queryKey: ['patients', 'list'],
    queryFn: () => patientService.list(),
  })

  const patientById = useMemo(
    () => new Map((patients ?? []).map((patient) => [patient.patientId, patient])),
    [patients],
  )

  const wards = useMemo(() => {
    const set = new Set<string>()
    patients?.forEach((patient) => set.add(patient.ward))
    return Array.from(set).sort()
  }, [patients])

  const kpis = useMemo(() => {
    const list = readings ?? []
    const flagged = list.filter((reading) => vitalsLevel(reading).level !== 'steady')
    const critical = list.filter((reading) => vitalsLevel(reading).level === 'critical')
    const recent = list.filter((reading) => isWithinMinutes(reading.recordedAt, 60))
    return {
      monitored: list.length,
      flagged: flagged.length,
      critical: critical.length,
      recent: recent.length,
    }
  }, [readings])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const minutes = toMinutes(timeRange)
    return (readings ?? []).filter((reading) => {
      if (level !== 'all' && vitalsLevel(reading).level !== level) return false
      if (ward !== 'all' && patientById.get(reading.patientId)?.ward !== ward) return false
      if (!isWithinMinutes(reading.recordedAt, minutes)) return false
      if (q) {
        const name = patientById.get(reading.patientId)?.fullName.toLowerCase() ?? ''
        const id = reading.patientId.toLowerCase()
        if (!name.includes(q) && !id.includes(q)) return false
      }
      return true
    })
  }, [readings, patientById, search, level, ward, timeRange])

  const mutateVitals = useMutation({
    mutationFn: (input: RecordVitalsInput) => vitalsService.record(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals', 'latest'] })
      queryClient.invalidateQueries({ queryKey: ['vitals', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['vitals', 'single'] })
      toast.success('Vitals recorded')
    },
    onError: () => toast.error('Could not record vitals.'),
  })

  const monitoredForDialog = useMemo(
    () =>
      Array.from(patientById.values()).filter(
        (patient) => patient.status !== 'discharged',
      ),
    [patientById],
  )

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Vitals"
        description="Latest observations across monitored patients."
        actions={
          clinician ? (
            <Button onClick={() => setRecordOpen(true)}>
              <Syringe aria-hidden="true" className="size-4" />
              Record vitals
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Monitored patients" value={kpis.monitored ? `${kpis.monitored}` : '0'} />
        <KpiTile
          label="Abnormal readings"
          value={kpis.flagged ? `${kpis.flagged}` : '0'}
          tone={kpis.flagged ? 'text-amber-600 dark:text-amber-400' : undefined}
        />
        <KpiTile
          label="Critical patients"
          value={kpis.critical ? `${kpis.critical}` : '0'}
          tone={kpis.critical ? 'text-destructive' : undefined}
        />
        <KpiTile
          label="Recent measurements"
          value={kpis.recent ? `${kpis.recent}` : '0'}
        />
      </div>
      <p className="text-xs text-muted-foreground">{VITALS_DISCLAIMER}</p>

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor="vitals-search" className="sr-only">
                Search vitals by patient
              </label>
              <Input
                id="vitals-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by patient name or ID…"
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-full lg:w-auto">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger aria-label="Filter by time range" className="w-full lg:w-40">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={level} onValueChange={(value) => setLevel(value as LevelFilter)}>
                <SelectTrigger aria-label="Filter by status" className="w-full lg:w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="steady">Steady</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ward} onValueChange={setWard}>
                <SelectTrigger aria-label="Filter by ward" className="w-full lg:w-44">
                  <SelectValue placeholder="All wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All wards</SelectItem>
                  {wards.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <VitalsTable
            readings={filtered}
            patientById={patientById}
            canRecord={clinician}
            onRecordVitals={(patient) => setRecordPatient(patient)}
          />
        </>
      )}

      <RecordVitalsDialog
        open={recordOpen || Boolean(recordPatient)}
        onOpenChange={(open) => {
          if (!open) {
            setRecordOpen(false)
            setRecordPatient(null)
          }
        }}
        patient={recordPatient ?? undefined}
        patients={monitoredForDialog}
        recorderName={session?.user.fullName ?? 'Clinical Staff'}
        onSubmit={mutateVitals.mutateAsync}
      />
    </Container>
  )
}