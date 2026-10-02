import { useQuery } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, HeartPulse, TrendingUp } from 'lucide-react'
import { cn } from 'cn'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import {
  VitalMetric,
  VitalsChart,
  VitalsLevelBadge,
} from '@/components/clinical'
import { patientService, vitalsService } from '@/services'
import {
  VITALS_DISCLAIMER,
  vitalsLevel,
} from '@/lib/clinical'
import { userInitials } from '@/lib/utils'

const chartStroke = 'var(--color-chart-1)'
const chartStrokeSecondary = 'var(--color-chart-2)'
const chartStrokeTertiary = 'var(--color-chart-3)'
const chartStrokeFourth = 'var(--color-chart-4)'

type RangeDays = 1 | 3 | 7 | 14

const RANGE_OPTIONS: Array<{ days: RangeDays; label: string }> = [
  { days: 1, label: '24 hours' },
  { days: 3, label: '3 days' },
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
]

const REFERENCE_RANGES: Record<string, string> = {
  heartRate: '60–100 bpm',
  systolic: '90–120 mmHg',
  diastolic: '60–80 mmHg',
  temperature: '36.5–37.5 °C',
  spo2: '95–100%',
  respiratoryRate: '12–20 /min',
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="mb-2">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

/** Per-patient vitals history: range selector, trend strip and charts. */
export function VitalsHistoryPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const id = patientId ?? ''
  const [rangeDays, setRangeDays] = useState(7)

  const { data: patient, isLoading: patientLoading, isError: patientError, refetch } = useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientService.get(id),
    enabled: Boolean(id),
  })
  const { data: latest } = useQuery({
    queryKey: ['vitals', 'single', id],
    queryFn: () => vitalsService.getReading(id),
    enabled: Boolean(id),
  })
  const { data: history } = useQuery({
    queryKey: ['vitals', 'history', id, rangeDays],
    queryFn: () => vitalsService.historyFor(id, rangeDays),
    enabled: Boolean(id),
  })

  if (patientLoading) {
    return (
      <Container size="fluid" className="max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8">
        <LoadingState rows={8} />
      </Container>
    )
  }

  if (patientError || !patient) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Patient not found"
          description="The vitals record for this patient is unavailable."
          onRetry={() => refetch()}
          actions={
            <Button asChild variant="outline">
              <Link to="/app/vitals">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back to vitals
              </Link>
            </Button>
          }
        />
      </Container>
    )
  }

  const flag = latest ? vitalsLevel(latest) : null
  const chartData = history ?? []
  const previous = chartData.length >= 2 ? chartData[chartData.length - 2] : undefined

  const rangeLabel =
    RANGE_OPTIONS.find((option) => option.days === rangeDays)?.label ?? '7 days'

  if (!latest) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link to="/app/vitals">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Vitals
          </Link>
        </Button>
        <PageHeader
          title="Vitals history"
          description={`${patient.fullName} · ${patient.patientId}`}
          actions={
            <span
              className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              {userInitials(patient.fullName)}
            </span>
          }
        />
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          No observations recorded for this patient yet.
        </div>
      </Container>
    )
  }

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/app/vitals">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Vitals
        </Link>
      </Button>

      <PageHeader
        title="Vitals history"
        description={`${patient.fullName} · ${patient.patientId} · last ${rangeLabel.toLowerCase()}`}
        actions={
          <>
            <span
              className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              {userInitials(patient.fullName)}
            </span>
            {flag ? <VitalsLevelBadge level={flag.level} label={flag.label} /> : null}
            <Button asChild variant="outline">
              <Link to={`/app/patients/${patient.patientId}`}>
                <HeartPulse aria-hidden="true" className="size-4" />
                Patient record
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border bg-card p-1" role="group" aria-label="Vitals time range">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.days}
              size="sm"
              variant={rangeDays === option.days ? 'secondary' : 'ghost'}
              className={cn('px-3', rangeDays === option.days ? 'font-medium' : 'text-muted-foreground')}
              onClick={() => setRangeDays(option.days)}
              aria-pressed={rangeDays === option.days}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{VITALS_DISCLAIMER}</p>
      </div>

      {previous ? (
        <section aria-label="Latest and previous reading" className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-sm font-medium">
            <TrendingUp aria-hidden="true" className="size-4 text-muted-foreground" />
            Latest vs previous reading
          </h2>
          <p className="text-xs text-muted-foreground sr-only">
            Latest values compared with the previous observation point. Reference bands are demo ranges only.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <VitalMetric label="Heart rate" value={latest.heartRate} unit="bpm" previous={previous.heartRate} reference={REFERENCE_RANGES.heartRate} />
            <VitalMetric label="Systolic" value={latest.systolic} unit="mmHg" previous={previous.systolic} reference={REFERENCE_RANGES.systolic} />
            <VitalMetric label="Diastolic" value={latest.diastolic} unit="mmHg" previous={previous.diastolic} reference={REFERENCE_RANGES.diastolic} />
            <VitalMetric label="Temperature" value={latest.temperature} unit="°C" previous={previous.temperature} reference={REFERENCE_RANGES.temperature} />
            <VitalMetric label="SpO₂" value={latest.spo2} unit="%" previous={previous.spo2} reference={REFERENCE_RANGES.spo2} />
            <VitalMetric label="Respiratory rate" value={latest.respiratoryRate} unit="/min" previous={previous.respiratoryRate} reference={REFERENCE_RANGES.respiratoryRate} />
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Heart rate" description="Beats per minute over time">
          {chartData.length ? (
            <VitalsChart
              data={chartData}
              metric="heartRate"
              unit="bpm"
              color={chartStroke}
              refLines={[60, 100]}
            />
          ) : (
            <NoHistory />
          )}
        </ChartCard>
        <ChartCard title="Blood pressure" description="Systolic and diastolic (mmHg)">
          {chartData.length ? (
            <div className="space-y-3">
              <VitalsChart
                data={chartData}
                metric="systolic"
                unit="mmHg"
                color={chartStrokeSecondary}
                refLines={[120]}
              />
              <VitalsChart
                data={chartData}
                metric="diastolic"
                unit="mmHg"
                color={chartStrokeTertiary}
                refLines={[80]}
              />
            </div>
          ) : (
            <NoHistory />
          )}
        </ChartCard>
        <ChartCard title="Temperature" description="Core temperature (°C)">
          {chartData.length ? (
            <VitalsChart
              data={chartData}
              metric="temperature"
              unit="°C"
              color={chartStrokeFourth}
              domain={[34, 42]}
              refLines={[37]}
            />
          ) : (
            <NoHistory />
          )}
        </ChartCard>
        <ChartCard title="SpO₂" description="Oxygen saturation (%)">
          {chartData.length ? (
            <VitalsChart
              data={chartData}
              metric="spo2"
              unit="%"
              color={chartStrokeTertiary}
              domain={[80, 100]}
              refLines={[95]}
            />
          ) : (
            <NoHistory />
          )}
        </ChartCard>
      </div>
    </Container>
  )
}

function NoHistory() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <p className="text-sm text-muted-foreground">No history available yet.</p>
    </div>
  )
}