import type {
  DonorAvailability,
  DonorEvaluationStatus,
  IschemiaStatus,
  MatchStatus,
  OrganType,
  UrgencyLevel,
  WaitlistPriority,
  WaitlistStatus,
} from '@/types/organ'
import {
  DONOR_AVAILABILITY_LABELS,
  DONOR_EVALUATION_LABELS,
  ISCHEMIA_STATUS_LABELS,
  MATCH_STATUS_LABELS,
  ORGAN_TYPE_LABELS,
  URGENCY_LABELS,
  WAITLIST_PRIORITY_LABELS,
  WAITLIST_STATUS_LABELS,
} from '@/types/organ'
import { StatusBadge, type StatusTone } from '@/components/common/status-badge'

const organTone: Record<OrganType, StatusTone> = {
  kidney: 'info',
  liver: 'warning',
  heart: 'critical',
  lung: 'info',
  pancreas: 'neutral',
}

const urgencyTone: Record<UrgencyLevel, StatusTone> = {
  urgent: 'critical',
  high: 'warning',
  standard: 'neutral',
}

const matchStatusTone: Record<MatchStatus, StatusTone> = {
  pending_review: 'warning',
  active: 'info',
  offered: 'info',
  accepted: 'success',
  transplant_scheduled: 'success',
  completed: 'neutral',
  declined: 'critical',
}

const waitlistPriorityTone: Record<WaitlistPriority, StatusTone> = {
  urgent: 'critical',
  high: 'warning',
  medium: 'neutral',
}

const waitlistStatusTone: Record<WaitlistStatus, StatusTone> = {
  listed: 'neutral',
  active: 'info',
  matched: 'success',
  transplanted: 'success',
  dormant: 'warning',
}

const donorEvaluationTone: Record<DonorEvaluationStatus, StatusTone> = {
  registered: 'neutral',
  under_evaluation: 'warning',
  available: 'success',
  matched: 'success',
  deferred: 'neutral',
}

const ischemiaTone: Record<IschemiaStatus, StatusTone> = {
  stable: 'success',
  active: 'info',
  critical: 'critical',
  completed: 'neutral',
}

export function OrganTypeBadge({
  organ,
  className,
}: {
  organ: OrganType
  className?: string
}) {
  return <StatusBadge tone={organTone[organ]} label={ORGAN_TYPE_LABELS[organ]} className={className} />
}

export function UrgencyBadge({
  urgency,
  className,
}: {
  urgency: UrgencyLevel
  className?: string
}) {
  return (
    <StatusBadge tone={urgencyTone[urgency]} label={URGENCY_LABELS[urgency]} className={className} />
  )
}

export function MatchStatusBadge({
  status,
  className,
}: {
  status: MatchStatus
  className?: string
}) {
  return (
    <StatusBadge
      tone={matchStatusTone[status]}
      label={MATCH_STATUS_LABELS[status]}
      className={className}
    />
  )
}

export function WaitlistPriorityBadge({
  priority,
  className,
}: {
  priority: WaitlistPriority
  className?: string
}) {
  return (
    <StatusBadge
      tone={waitlistPriorityTone[priority]}
      label={WAITLIST_PRIORITY_LABELS[priority]}
      className={className}
    />
  )
}

export function WaitlistStatusBadge({
  status,
  className,
}: {
  status: WaitlistStatus
  className?: string
}) {
  return (
    <StatusBadge
      tone={waitlistStatusTone[status]}
      label={WAITLIST_STATUS_LABELS[status]}
      className={className}
    />
  )
}

export function DonorEvaluationBadge({
  status,
  className,
}: {
  status: DonorEvaluationStatus
  className?: string
}) {
  return (
    <StatusBadge
      tone={donorEvaluationTone[status]}
      label={DONOR_EVALUATION_LABELS[status]}
      className={className}
    />
  )
}

const donorAvailabilityTone: Record<DonorAvailability, StatusTone> = {
  ready: 'success',
  pending: 'warning',
  unavailable: 'neutral',
}

export function DonorAvailabilityBadge({
  availability,
  className,
}: {
  availability: DonorAvailability
  className?: string
}) {
  return (
    <StatusBadge
      tone={donorAvailabilityTone[availability]}
      label={DONOR_AVAILABILITY_LABELS[availability]}
      className={className}
    />
  )
}

export function IschemiaStatusBadge({
  status,
  className,
}: {
  status: IschemiaStatus
  className?: string
}) {
  return (
    <StatusBadge
      tone={ischemiaTone[status]}
      label={ISCHEMIA_STATUS_LABELS[status]}
      className={className}
    />
  )
}