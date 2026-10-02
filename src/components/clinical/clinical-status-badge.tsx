import type { BedStatus, PatientStatus, VitalsLevel } from '@/types/clinical'
import {
  StatusBadge,
  type StatusTone,
} from '@/components/common/status-badge'

const patientStatusMap: Record<PatientStatus, { tone: StatusTone; label: string }> = {
  stable: { tone: 'success', label: 'Stable' },
  under_observation: { tone: 'warning', label: 'Under observation' },
  critical: { tone: 'critical', label: 'Critical' },
  discharged: { tone: 'neutral', label: 'Discharged' },
}

const bedStatusMap: Record<BedStatus, { tone: StatusTone; label: string }> = {
  available: { tone: 'success', label: 'Available' },
  occupied: { tone: 'info', label: 'Occupied' },
  cleaning: { tone: 'neutral', label: 'Cleaning' },
  reserved: { tone: 'warning', label: 'Reserved' },
}

const vitalsLevelMap: Record<VitalsLevel, { tone: StatusTone; label: string }> = {
  steady: { tone: 'success', label: 'Steady' },
  watch: { tone: 'warning', label: 'Watch' },
  critical: { tone: 'critical', label: 'Critical' },
}

export function PatientStatusBadge({
  status,
  className,
}: {
  status: PatientStatus
  className?: string
}) {
  const meta = patientStatusMap[status]
  return <StatusBadge tone={meta.tone} label={meta.label} className={className} />
}

export function BedStatusBadge({
  status,
  className,
}: {
  status: BedStatus
  className?: string
}) {
  const meta = bedStatusMap[status]
  return <StatusBadge tone={meta.tone} label={meta.label} className={className} />
}

export function VitalsLevelBadge({
  level,
  label,
  className,
}: {
  level: VitalsLevel
  label: string
  className?: string
}) {
  const meta = vitalsLevelMap[level]
  return <StatusBadge tone={meta.tone} label={label} className={className} />
}