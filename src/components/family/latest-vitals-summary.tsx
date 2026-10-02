import { Activity } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { VitalsLevelBadge } from '@/components/clinical'
import type { VitalsReading } from '@/types/clinical'
import { VITALS_DISCLAIMER, formatDateTime, vitalsLevel } from '@/lib/clinical'

function ReadingRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">
        {value}
        {unit ? <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span> : null}
      </dd>
    </div>
  )
}

/** Latest vitals in plain language for family members. */
export function LatestVitalsSummary({ reading }: { reading: VitalsReading | null }) {
  if (!reading) {
    return (
      <EmptyState
        icon={Activity}
        title="No observations yet"
        description="Latest readings will appear here once recorded by the care team."
      />
    )
  }

  const flag = vitalsLevel(reading)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Recorded {formatDateTime(reading.recordedAt)}
        </p>
        <VitalsLevelBadge level={flag.level} label={flag.label} />
      </div>
      <dl className="divide-y divide-border rounded-lg border px-4 py-1">
        <ReadingRow label="Heart rate" value={String(reading.heartRate)} unit="bpm" />
        <ReadingRow
          label="Blood pressure"
          value={`${reading.systolic}/${reading.diastolic}`}
          unit="mmHg"
        />
        <ReadingRow label="Temperature" value={reading.temperature.toFixed(1)} unit="°C" />
        <ReadingRow label="Blood oxygen (SpO₂)" value={`${reading.spo2}%`} />
      </dl>
      <p className="text-xs text-muted-foreground">{VITALS_DISCLAIMER}</p>
    </div>
  )
}